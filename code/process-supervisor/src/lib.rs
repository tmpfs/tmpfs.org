#![deny(missing_docs)]
//! Process supervisor using JSON-RPC for inter-process communication.
//!
//! Currently only supports Unix, later we plan to add support for Windows using named pipes.
//!
//! ## Supervisor
//!
//! Supervisor manages child processes sending socket information over stdin and then switching 
//! to Unix domain sockets for inter-process communication. Daemon processes are restarted if 
//! they die without being shutdown by the supervisor.
//!
//! ```
//! use psup::{Result, supervisor::SupervisorBuilder};
//!
//! #[tokio::main]
//! async fn main() -> Result<()> {
//!    let socket_path = std::env::temp_dir().join("supervisor.sock");
//!    let worker_cmd = "./target/debug/worker";
//!    let supervisor = SupervisorBuilder::new(socket_path.to_path_buf())
//!        .add_daemon(worker_cmd.to_string(), vec![])
//!        .add_daemon(worker_cmd.to_string(), vec![])
//!        .build();
//!    supervisor.run().await?;
//! 
//!    // Simulate a blocking supervisor process
//!    loop {
//!        std::thread::sleep(std::time::Duration::from_secs(60))
//!    }
//! }
//! ```
//! 
//! ## Worker
//!
//! Worker reads the socket information from stdin and then connects to the Unix socket.
//!
//! ```
//! use psup::{Result, worker};
//! 
//! #[tokio::main]
//! async fn main() -> Result<()> {
//!     // Read supervisor information from stdin
//!     let mut info = worker::read()?;
//!     if let Some(connect) = info.take() {
//!         // Set up the IPC channel with the supervisor
//!         worker::connect(connect).await?;
//!     }
//!     Ok(())
//! }
//! ```

use json_rpc2::{Request, Response};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Enumeration of errors.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// Error generated by the supervisor if a worker could not be found.
    #[cfg(feature = "supervisor")]
    #[error("Failed to find worker with id {0}")]
    WorkerNotFound(String),

    /// Errors generated by the rpc library.
    #[error(transparent)]
    Rpc(#[from] json_rpc2::Error),

    /// Input/output errors.
    #[error(transparent)]
    Io(#[from] std::io::Error),

    /// JSON serialize/deserialize errors.
    #[error(transparent)]
    Json(#[from] serde_json::Error),

    /// Error whilst sending bind notifications.
    #[error(transparent)]
    Oneshot(#[from] tokio::sync::oneshot::error::RecvError),

    /// Error generated whilst attempting to read lines from the socket.
    #[error(transparent)]
    Lines(#[from] tokio_util::codec::LinesCodecError),
}

/// Result type returned by the library.
pub type Result<T> = std::result::Result<T, Error>;

#[cfg(feature = "worker")]
pub mod worker;

#[cfg(feature = "supervisor")]
pub mod supervisor;

pub(crate) const CONNECTED: &str = "connected";

/// Encodes whether an IPC message is a request or 
/// a response so that we can do bi-directional 
/// communication over the same socket.
#[derive(Debug, Serialize, Deserialize)]
pub enum Message {
    /// RPC request message.
    #[serde(rename = "request")]
    Request(Request),
    /// RPC response message.
    #[serde(rename = "response")]
    Response(Response),
}

/// Message sent over stdin when launching a worker.
#[derive(Debug, Serialize, Deserialize)]
pub struct WorkerInfo {
    /// Socket path.
    pub socket_path: PathBuf,
    /// Worker identifier.
    pub id: String,
}

/// Message sent to the supervisor when a worker
/// is spawned and has connected to the IPC socket.
#[derive(Debug, Serialize, Deserialize)]
pub struct Connected {
    /// Worker identifier.
    pub id: String,
}
