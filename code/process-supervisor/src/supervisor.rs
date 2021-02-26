use tokio::sync::oneshot;

mod ipc;

use log::info;

#[tokio::main]
async fn main() -> ipc::Result<()> {
    if std::env::var("RUST_LOG").ok().is_none() {
        std::env::set_var("RUST_LOG", "info");
    }
    pretty_env_logger::init();

    let worker_cmd = "./target/debug/worker";
    let worker_args = vec![];

    let socket_path = std::env::temp_dir().join("supervisor.sock");
    let worker_socket_path = socket_path.clone();

    info!("Start supervisor {}", socket_path.display());

    let (tx, rx) = oneshot::channel::<()>();

    tokio::spawn(async move {
        ipc::supervisor::start(socket_path, tx)
            .await
            .expect("Unable to start ipc server");
    });

    let _ = rx.await?;
    info!("Server is listening {}", worker_socket_path.display());

    for i in 0..1 {
        ipc::supervisor::spawn_worker(
            i,
            worker_cmd,
            worker_args.clone(),
            worker_socket_path.to_string_lossy().into_owned());
    }

    loop {
        std::thread::sleep(std::time::Duration::from_secs(60))
    }
}
