use std::collections::hash_map::DefaultHasher;
use std::hash::Hasher;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};

use tokio::io::AsyncWriteExt;
use tokio::net::UnixListener;
use tokio::sync::oneshot::{self, Sender};
use tokio_util::codec::{FramedRead, LinesCodec};

use futures::StreamExt;

use rand::Rng;
use async_trait::async_trait;
use json_rpc2::{
    futures::{Server, Service},
    Request, Response,
};
use log::{debug, error, info, warn};
use once_cell::sync::OnceCell;

use super::{Connected, Error, Message, Launch, Result, CONNECTED};

fn supervisor_state() -> &'static Arc<Mutex<SupervisorState>> {
    static INSTANCE: OnceCell<Arc<Mutex<SupervisorState>>> = OnceCell::new();
    INSTANCE.get_or_init(|| {
        Arc::new(Mutex::new(SupervisorState { workers: vec![] }))
    })
}

fn supervisor_service(
) -> &'static Box<dyn Service<Data = Arc<Mutex<SupervisorState>>>> {
    static INSTANCE: OnceCell<
        Box<dyn Service<Data = Arc<Mutex<SupervisorState>>>>,
    > = OnceCell::new();
    INSTANCE.get_or_init(|| {
        let service: Box<dyn Service<Data = Arc<Mutex<SupervisorState>>>> =
            Box::new(SupervisorService {});
        service
    })
}

#[derive(Debug)]
pub struct SupervisorBuilder {
    socket: PathBuf,
    commands: Vec<(String, Vec<String>)>,
}

impl SupervisorBuilder {
    pub fn new(socket: PathBuf) -> Self {
        Self {
            socket,
            commands: Vec::new()
        }
    }

    pub fn add_worker(mut self, cmd: String, args: Vec<String>) -> Self {
        self.commands.push((cmd, args));
        self
    }

    pub fn build(self) -> Supervisor {
        Supervisor {
            socket: self.socket,
            commands: self.commands
        }
    }
}

#[derive(Debug)]
pub struct Supervisor {
    socket: PathBuf,
    commands: Vec<(String, Vec<String>)>,
}

impl Supervisor {
    pub async fn run(&self) -> Result<()> {
        let socket_path = self.socket.clone();
        let (tx, rx) = oneshot::channel::<()>();

        tokio::spawn(async move {
            listen(&socket_path, tx)
                .await
                .expect("Unable to start ipc server");
        });

        let _ = rx.await?;
        info!("Supervisor is listening {}", self.socket.display());

        for (cmd, args) in self.commands.iter() {
            spawn_worker(
                cmd.to_string(),
                args.clone(),
                self.socket.clone());
        }

        Ok(())
    }
}

pub struct SupervisorState {
    workers: Vec<Worker>,
}

impl SupervisorState {
    fn find(&mut self, id: &str) -> Option<&mut Worker> {
        self.workers.iter_mut().find(|w| w.id == id)
    }

    fn remove(&mut self, pid: u32) -> Option<Worker> {
        let res = self.workers.iter().enumerate().find_map(|(i, w)| {
            if w.pid.is_some() && w.pid.unwrap() == pid {
                Some(i)
            } else {
                None
            }
        });
        if let Some(position) = res {
            Some(self.workers.swap_remove(position))
        } else {
            None
        }
    }
}

#[derive(Debug)]
pub struct Worker {
    cmd: String,
    args: Vec<String>,
    handle: JoinHandle<std::io::Result<()>>,
    id: String,
    socket_path: PathBuf,
    pid: Option<u32>,
    /// If we are shutting down this worker explicitly
    /// this flag will be set to prevent the worker from
    /// being re-spawned.
    reap: bool,
}

impl PartialEq for Worker {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id && self.pid == other.pid
    }
}

impl Eq for Worker {}

pub struct SupervisorService;

#[async_trait]
impl Service for SupervisorService {
    type Data = Arc<Mutex<SupervisorState>>;
    async fn handle(
        &self,
        req: &mut Request,
        ctx: &Self::Data,
    ) -> json_rpc2::Result<Option<Response>> {
        let mut response = None;
        if req.matches(CONNECTED) {
            let info: Connected = req.deserialize()?;
            info!("Worker connected {:?}", info);
            let mut state = ctx.lock().unwrap();
            let worker = state.find(&info.id);
            if let Some(worker) = worker {
                worker.pid = Some(info.pid);
                response = Some(req.into());
                //println!("Saving worker pid {:?}", response);
            } else {
                let err =
                    json_rpc2::Error::boxed(Error::WorkerNotFound(info.id));
                response = Some((req, err).into())
            }
        }
        Ok(response)
    }
}

/// Attempt to restart a worker that died.
pub(crate) fn restart(worker: Worker) {
    info!("Restarting worker {}", worker.id);
    // TODO: retry on fail with backoff and retry limit
    spawn_worker(worker.cmd, worker.args, worker.socket_path)
}

fn spawn_worker(
    cmd: String,
    args: Vec<String>,
    socket_path: PathBuf,
) {
    // Generate an id for each worker
    let mut rng = rand::thread_rng();
    let mut hasher = DefaultHasher::new();
    hasher.write_usize(rng.gen());
    let id = format!("{:x}", hasher.finish());

    let worker_socket = socket_path.clone();
    let worker_cmd = cmd.clone();
    let worker_args = args.clone();
    let worker_id = id.clone();

    let handle = thread::spawn(move || {
        let mut child = Command::new(worker_cmd)
            .args(worker_args)
            .stdin(Stdio::piped())
            .spawn()?;

        let child_stdin = child.stdin.as_mut().unwrap();
        let connect_params = Launch {
            socket_path: worker_socket,
            id: worker_id,
        };
        let req = Request::new_notification(
            "connect",
            serde_json::to_value(connect_params).ok(),
        );
        child_stdin.write_all(
            format!("{}\n", serde_json::to_string(&req).unwrap()).as_bytes(),
        )?;

        drop(child_stdin);

        let pid = child.id();
        let _ = child.wait_with_output()?;

        warn!("Worker process died: {}", pid);

        let mut state = supervisor_state().lock().unwrap();
        let worker = state.remove(pid);
        drop(state);
        if let Some(worker) = worker {
            info!("Removed child worker (id: {}, pid {})", worker.id, pid);
            if !worker.reap {
                restart(worker);
            }
        } else {
            error!("Failed to remove stale worker for pid {}", pid);
        }

        Ok::<(), io::Error>(())
    });

    let worker = Worker {
        cmd,
        args,
        handle,
        id,
        socket_path,
        pid: None,
        reap: false,
    };
    let mut state = supervisor_state().lock().unwrap();
    state.workers.push(worker);
}

async fn listen<P: AsRef<Path>>(socket: P, tx: Sender<()>) -> Result<()> {
    let path = socket.as_ref();

    // If the socket file exists we must remove to prevent `EADDRINUSE`
    if path.exists() {
        std::fs::remove_file(path)?;
    }

    let listener = UnixListener::bind(socket).unwrap();
    tx.send(()).unwrap();

    loop {
        match listener.accept().await {
            Ok((stream, _addr)) => {
                let (reader, mut writer) = stream.into_split();
                tokio::task::spawn(async move {
                    let server = Server::new(vec![supervisor_service()]);
                    let mut lines = FramedRead::new(reader, LinesCodec::new());
                    while let Some(line) = lines.next().await {
                        let line = line?;
                        match serde_json::from_str::<Message>(&line)? {
                            Message::Request(mut req) => {
                                debug!("{:?}", req);
                                let res = server
                                    .serve(
                                        &mut req,
                                        &Arc::clone(supervisor_state()),
                                    )
                                    .await;
                                debug!("{:?}", res);
                                if let Some(response) = res {
                                    let msg = Message::Response(response);
                                    writer
                                        .write_all(
                                            format!(
                                                "{}\n",
                                                serde_json::to_string(&msg)?
                                            )
                                            .as_bytes(),
                                        )
                                        .await?;
                                }
                            }
                            Message::Response(reply) => {
                                // Currently not handling RPC replies so just log them
                                if let Some(err) = reply.error() {
                                    error!("{:?}", err);
                                } else{
                                    debug!("{:?}", reply);
                                }
                            }
                        }
                    }
                    Ok::<(), Error>(())
                });
            }
            Err(e) => {
                warn!("Worker socket failed to accept {}", e);
            }
        }
    }
}
