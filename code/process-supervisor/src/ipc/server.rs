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

use json_rpc2::{Request, Response, Service, Server, from_str};

use super::{Error, Result, SOCKET_PATH, CONNECTED};

pub struct Worker {
    handle: JoinHandle<std::io::Result<()>>,
}

#[derive(Serialize, Deserialize)]
pub struct ConnectParams {
    pub socket_path: String,
    pub id: usize,
}

pub struct SupervisorState;

pub struct SupervisorService;

impl Service for SupervisorService {
    type Data = ();
    fn handle(&self, req: &mut Request, ctx: &Self::Data) -> json_rpc2::Result<Option<Response>> {
        let mut response = None;
        if req.matches(CONNECTED) {
            let pid: u32 = req.deserialize()?;
            println!("Server got connected child {:?}", pid);
            response = Some(req.into());
        }
        Ok(response)
    }
}

pub(crate) fn spawn_worker(id: usize) -> Worker {
    let handle = thread::spawn(move || {
        let mut child = Command::new("./target/debug/child")
            //.args(vec!["run", "--bin=child"])
            .stdin(Stdio::piped())
            //.stdout(Stdio::piped())
            .spawn()?;

        let child_stdin = child.stdin.as_mut().unwrap();
        let connect_params = ConnectParams {socket_path: SOCKET_PATH.to_string(), id};
        let req = Request::new_notification("connect", serde_json::to_value(connect_params).ok());
        //println!("Send {:?}", req);
        child_stdin.write_all(format!("{}\n", serde_json::to_string(&req).unwrap()).as_bytes())?;

        drop(child_stdin);

        let _ = child.wait_with_output()?;

        Ok::<(), io::Error>(())
    });

    Worker {handle}
}

pub(crate) async fn start(socket: &'static str, tx: Sender<()>) -> Result<()> {
    let path = PathBuf::from(socket);
    if path.exists() {
        std::fs::remove_file(path)?;
    }

    let listener = LocalSocketListener::bind(socket)
        .await
        .unwrap();

    tx.send(()).unwrap();

    let service: Box<dyn Service<Data = ()>> = Box::new(SupervisorService {});
    let handler = Arc::new(Server::new(vec![&service]));
    let server = &handler;

    listener
        .incoming()
        .try_for_each(|mut conn| async move {
            let mut conn = BufReader::new(conn);
            let mut buffer = String::new();
            conn.read_line(&mut buffer).await?;
            let mut req = from_str(&buffer)
                .expect("Failed to parse client message");
            println!("Server got: {:?}", req);
            let res = server.serve(&mut req, &());
            println!("Server response: {:?}", res);
            Ok(())
        })
        .await
        .map_err(Error::from)?;
    Ok(())
}
