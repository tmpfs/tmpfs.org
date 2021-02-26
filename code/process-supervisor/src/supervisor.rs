use tokio::sync::oneshot;

mod ipc;
use ipc::*;

use log::info;

const CMD: &str = "./target/debug/worker";

#[tokio::main]
async fn main() -> ipc::Result<()> {
    if std::env::var("RUST_LOG").ok().is_none() {
        std::env::set_var("RUST_LOG", "info");
    }
    pretty_env_logger::init();

    info!("Start supervisor {}", SOCKET_PATH);

    let (tx, rx) = oneshot::channel::<()>();

    tokio::spawn(async move {
        ipc::supervisor::start(SOCKET_PATH, tx).await
            .expect("Unable to start ipc server");
    });

    let _ = rx.await?;
    info!("Server is listening {}", SOCKET_PATH);

    for i in 0..2 {
        ipc::supervisor::spawn_worker(i, CMD, vec![]);
    }

    loop {
        std::thread::sleep(std::time::Duration::from_secs(60))
    }
}
