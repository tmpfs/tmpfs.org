use std::path::PathBuf;
use std::io::{self, Write};
use std::thread::{self, JoinHandle};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};

use serde::{Serialize, Deserialize};
use tokio::sync::oneshot::Sender;

use futures::{
    io::{AsyncBufReadExt, BufReader},
    stream::TryStreamExt,
};
use interprocess::nonblocking::local_socket::*;

use log::{info, warn, error};

use json_rpc2::{Request, Response, Service, Server, from_str};

use once_cell::sync::Lazy;

use super::{Error, Result, Connected, SOCKET_PATH, CONNECTED};

static STATE: Lazy<Mutex<SupervisorState>> = Lazy::new(|| {
    Mutex::new(SupervisorState { workers: vec![] })
});

pub struct SupervisorState {
    workers: Vec<Worker>,
}

impl SupervisorState {
    fn find(&mut self, id: usize) -> Option<&mut Worker> {
        self.workers.iter_mut().find(|w| w.id == id) 
    }

    fn remove(&mut self, pid: u32) -> Option<Worker> {
        let res = self.workers
            .iter()
            .enumerate()
            .find_map(|(i, w)| {
                if w.pid.is_some() && w.pid.unwrap() == pid {
                    Some(i) 
                } else { None }
            });
        if let Some(position) = res {
            Some(self.workers.swap_remove(position))
        } else { None }
    }
}

#[derive(Debug)]
pub struct Worker {
    cmd: &'static str,
    args: Vec<&'static str>,
    handle: JoinHandle<std::io::Result<()>>,
    id: usize,
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

#[derive(Serialize, Deserialize)]
pub struct Launch {
    pub socket_path: String,
    pub id: usize,
}

pub struct SupervisorService;

impl Service for SupervisorService {
    type Data = Mutex<SupervisorState>;
    fn handle(&self, req: &mut Request, ctx: &Self::Data) -> json_rpc2::Result<Option<Response>> {
        let mut response = None;
        if req.matches(CONNECTED) {
            let info: Connected = req.deserialize()?;
            info!("Server got connected child {:?}", info);
            let mut state = ctx.lock().unwrap();
            let worker = state.find(info.id);
            if let Some(worker) = worker {
                println!("Saving worker pid...");
                worker.pid = Some(info.pid);
                response = Some(req.into());
            } else {
                let err = json_rpc2::Error::boxed(Error::WorkerNotFound(info.id));
                response = Some((req, err).into())
            }
        }
        Ok(response)
    }
}

/// Attempt to restart a worker that died.
pub(crate) fn restart(worker: Worker) {
    println!("Respawn the worker {:?}", worker);
    // TODO: retry on fail with backoff and retry limit

    spawn_worker(worker.id, worker.cmd, worker.args)
}

pub(crate) fn spawn_worker(id: usize, cmd: &'static str, args: Vec<&'static str>) {
    let worker_args = args.clone();
    let handle = thread::spawn(move || {
        let mut child = Command::new(cmd)
            .args(worker_args)
            .stdin(Stdio::piped())
            .spawn()?;

        let child_stdin = child.stdin.as_mut().unwrap();
        let connect_params = Launch {socket_path: SOCKET_PATH.to_string(), id};
        let req = Request::new_notification("connect", serde_json::to_value(connect_params).ok());
        child_stdin.write_all(format!("{}\n", serde_json::to_string(&req).unwrap()).as_bytes())?;

        drop(child_stdin);

        let pid = child.id();
        let _ = child.wait_with_output()?;

        warn!("Worker process shutdown: {}", pid);

        let mut state = STATE.lock().unwrap();
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

    let worker = Worker { cmd, args, handle, id, pid: None, reap: false };
    let mut state = STATE.lock().unwrap();
    state.workers.push(worker);
}

pub(crate) async fn start(socket: &'static str, tx: Sender<()>) -> Result<()> {

    // If the socket file exists we must remove to prevent `EADDRINUSE`
    let path = PathBuf::from(socket);
    if path.exists() {
        std::fs::remove_file(path)?;
    }

    let listener = LocalSocketListener::bind(socket)
        .await
        .unwrap();

    tx.send(()).unwrap();

    let state = &STATE;
    let service: Box<dyn Service<Data = Mutex<SupervisorState>>> = Box::new(SupervisorService {});
    let handler = Arc::new(Server::new(vec![&service]));
    let server = &handler;

    listener
        .incoming()
        .try_for_each(|conn| async move {
            let mut conn = BufReader::new(conn);
            let mut buffer = String::new();
            conn.read_line(&mut buffer).await?;
            let mut req = from_str(&buffer)
                .expect("Failed to parse client message");
            info!("{:?}", req);
            let res = server.serve(&mut req, &state);
            info!("{:?}", res);
            Ok(())
        })
        .await
        .map_err(Error::from)?;

    Ok(())
}
