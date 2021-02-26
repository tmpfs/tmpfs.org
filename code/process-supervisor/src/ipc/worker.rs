use json_rpc2::{
    futures::{Server, Service},
    Request, Response,
};
use std::io::{self, BufRead};
use std::process;
use std::sync::{Arc, Mutex};

use futures::StreamExt;
use tokio::io::AsyncWriteExt;
use tokio::net::UnixStream;
use tokio_util::codec::{FramedRead, LinesCodec};

use async_trait::async_trait;
use log::{debug, info, error};
use once_cell::sync::OnceCell;

use super::{Connected, Launch, Message, Result, CONNECTED};

pub(crate) const SHUTDOWN: &str = "shutdown";

fn worker_state() -> &'static Arc<Mutex<WorkerState>> {
    static INSTANCE: OnceCell<Arc<Mutex<WorkerState>>> = OnceCell::new();
    INSTANCE.get_or_init(|| Arc::new(Mutex::new(WorkerState { id: 0 })))
}

fn worker_service() -> &'static Box<dyn Service<Data = Arc<Mutex<WorkerState>>>>
{
    static INSTANCE: OnceCell<
        Box<dyn Service<Data = Arc<Mutex<WorkerState>>>>,
    > = OnceCell::new();
    INSTANCE.get_or_init(|| {
        let service: Box<dyn Service<Data = Arc<Mutex<WorkerState>>>> =
            Box::new(WorkerService {});
        service
    })
}

#[derive(Debug)]
pub struct WorkerState {
    id: usize,
}

pub struct WorkerService;

#[async_trait]
impl Service for WorkerService {
    type Data = Arc<Mutex<WorkerState>>;
    async fn handle(
        &self,
        req: &mut Request,
        ctx: &Self::Data,
    ) -> json_rpc2::Result<Option<Response>> {
        let mut response = None;
        if req.matches(CONNECTED) {
            let state = ctx.lock().unwrap();
            info!("Child service connected {}", state.id);
            response = Some(req.into());
        } else if req.matches(SHUTDOWN) {
            info!("Child going down now.");
            response = Some(req.into());
        }
        Ok(response)
    }
}

pub(crate) fn read_stdin_connect() -> Result<Option<Launch>> {
    let stdin = io::stdin();
    let mut info = None;
    for line in stdin.lock().lines() {
        if let Some(line) = line.ok() {
            info = Some(serde_json::from_str::<Request>(&line).unwrap());
            break;
        }
    }
    Ok(if let Some(mut info) = info.take() {
        Some(info.deserialize::<Launch>().unwrap())
    } else {
        None
    })
}

pub(crate) async fn start(info: Launch) -> Result<()> {
    let stream = UnixStream::connect(info.socket_path).await?;

    let (reader, mut writer) = stream.into_split();

    // Send a notification to the supervisor so that it knows
    // this worker is ready
    let params = serde_json::to_value(Connected {
        id: info.id,
        pid: process::id(),
    })?;
    let req =
        Message::Request(Request::new_notification(CONNECTED, Some(params)));
    let msg = format!("{}\n", serde_json::to_string(&req)?);
    writer.write_all(msg.as_bytes()).await?;
    //writer.write_all(b"{\n").await?;

    let mut lines = FramedRead::new(reader, LinesCodec::new());
    let server = Server::new(vec![worker_service()]);
    while let Some(line) = lines.next().await {
        let line = line?;
        println!("Got worker line {:?}", line);
        match serde_json::from_str::<Message>(&line)? {
            Message::Request(mut req) => {
                debug!("{:?}", req);
                let res =
                    server.serve(&mut req, &Arc::clone(worker_state())).await;
                debug!("{:?}", res);
                if let Some(response) = res {
                    let msg = Message::Response(response);
                    writer
                        .write_all(
                            format!("{}\n", serde_json::to_string(&msg)?)
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

    Ok(())
}
