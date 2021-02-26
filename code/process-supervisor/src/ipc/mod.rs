use json_rpc2::{Request, Response};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[cfg(feature = "supervisor")]
    #[error("Failed to find worker with id {0}")]
    WorkerNotFound(String),

    #[error(transparent)]
    Rpc(#[from] json_rpc2::Error),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Json(#[from] serde_json::Error),

    #[error(transparent)]
    Oneshot(#[from] tokio::sync::oneshot::error::RecvError),

    #[error(transparent)]
    Lines(#[from] tokio_util::codec::LinesCodecError),
}

pub type Result<T> = std::result::Result<T, Error>;

#[cfg(feature = "worker")]
pub(crate) mod worker;

#[cfg(feature = "supervisor")]
pub(crate) mod supervisor;

pub(crate) const CONNECTED: &str = "connected";

/// Top-level message that encodes whether the message
/// is am RPC request or a response so that we can do
/// bi-directional RPC communication over the same socket.
#[derive(Debug, Serialize, Deserialize)]
pub enum Message {
    #[serde(rename = "request")]
    Request(Request),
    #[serde(rename = "response")]
    Response(Response),
}

/// Message sent over stdin when launching a worker.
#[derive(Debug, Serialize, Deserialize)]
pub struct Launch {
    pub socket_path: PathBuf,
    pub id: String,
}

/// Message sent to the supervisor when a worker
/// is spawned and has connected to the IPC socket.
#[derive(Debug, Serialize, Deserialize)]
pub struct Connected {
    pub id: String,
}
