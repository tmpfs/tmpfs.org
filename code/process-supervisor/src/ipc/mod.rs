use serde::{Serialize, Deserialize};

#[derive(Debug, thiserror::Error)]
pub enum Error {

    #[error("Failed to find worker with id {0}")]
    WorkerNotFound(usize),

    #[error(transparent)]
    Rpc(#[from] json_rpc2::Error),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Json(#[from] serde_json::Error),

    #[error(transparent)]
    Oneshot(#[from] tokio::sync::oneshot::error::RecvError),
}

pub type Result<T> = std::result::Result<T, Error>;

#[cfg(feature = "worker")]
pub(crate) mod worker;

#[cfg(feature = "supervisor")]
pub(crate) mod supervisor;

pub(crate) const SOCKET_PATH: &str = "/tmp/supervisor.sock";
pub(crate) const CONNECTED: &str = "connected";

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectParams {
    pub socket_path: String,
    pub id: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Connected {
    pub id: usize,
    pub pid: u32,
}
