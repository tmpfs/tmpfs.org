mod ipc;
use ipc::supervisor::SupervisorBuilder;

#[tokio::main]
async fn main() -> ipc::Result<()> {
    if std::env::var("RUST_LOG").ok().is_none() {
        std::env::set_var("RUST_LOG", "info");
    }
    pretty_env_logger::init();

    let socket_path = std::env::temp_dir().join("supervisor.sock");
    let worker_cmd = "./target/debug/worker";
    let supervisor = SupervisorBuilder::new(socket_path.to_path_buf())
        .add_worker(worker_cmd.to_string(), vec![])
        .add_worker(worker_cmd.to_string(), vec![])
        .build();
    supervisor.run().await?;

    loop {
        std::thread::sleep(std::time::Duration::from_secs(60))
    }
}
