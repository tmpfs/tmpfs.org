use serde::{Serialize, Deserialize};

pub(crate) const SOCKET_PATH: &str = "/tmp/example.sock";

#[derive(Debug, thiserror::Error)]
pub enum Error {
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

#[cfg(feature = "child")]
pub(crate) mod child;

#[cfg(feature = "supervisor")]
pub(crate) mod server;

pub(crate) const CONNECTED: &str = "connected";

#[derive(Serialize, Deserialize)]
pub struct ConnectParams {
    pub socket_path: String,
    pub id: usize,
}
