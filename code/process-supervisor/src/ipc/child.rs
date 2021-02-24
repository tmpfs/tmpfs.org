use std::process;
use std::io::{self, BufRead};
use futures::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
};
use interprocess::nonblocking::local_socket::*;
use serde_json::{Value, Number};

use json_rpc2::{Service, Server, Request, Response, from_str};

use super::{Result, ConnectParams, CONNECTED};

pub(crate) const SHUTDOWN: &str = "shutdown";

pub struct ChildState {
    id: usize,
}

pub struct ChildService;

impl Service for ChildService {
    type Data = ChildState;
    fn handle(&self, req: &mut Request, ctx: &Self::Data) -> json_rpc2::Result<Option<Response>> {
        let mut response = None;
        if req.matches(CONNECTED) {
            println!("Child service connected {}", ctx.id);
            response = Some(req.into());
        } else if req.matches(SHUTDOWN) {
            println!("Child going down now.");
            response = Some(req.into());
        }
        Ok(response)
    }
}

pub(crate) fn read_stdin_connect() -> Result<Option<ConnectParams>> {
    let stdin = io::stdin();
    let mut info = None;
    for line in stdin.lock().lines() {
        if let Some(line) = line.ok() {
            info = Some(serde_json::from_str::<Request>(&line).unwrap());
            break;
        }
    }
    Ok(if let Some(mut info) = info.take() {
        Some(info.deserialize::<ConnectParams>().unwrap())
    } else { None })
}

pub(crate) async fn start(info: ConnectParams) -> Result<()> {
    println!("Starting client {} {}", info.id, &info.socket_path);
    let client_service: Box<dyn Service<Data = ChildState>> = Box::new(ChildService {});
    let server = Server::new(vec![&client_service]);

    let mut conn = LocalSocketStream::connect(info.socket_path)
        .await
        .unwrap();

    let req = Request::new_notification(CONNECTED, Some(Value::Number(Number::from(process::id()))));
    conn.write_all(format!("{}\n", serde_json::to_string(&req)?).as_bytes()).await?;

    //println!("Client connected {:?}", info.id);

    let mut conn = BufReader::new(conn);
    let mut buffer = String::new();
    conn.read_line(&mut buffer).await?;
    println!("Server sent: {}", &buffer);
    let mut req = from_str(&buffer)?;
    let res = server.serve(&mut req, &ChildState {id: info.id});
    println!("Child send response {:?}", res);
    conn.write_all(
        format!("{}\n", serde_json::to_string(&res)?).as_bytes()).await?;

    Ok(())
}
