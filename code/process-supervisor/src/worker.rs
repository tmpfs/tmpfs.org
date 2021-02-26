mod ipc;

use log::info;

#[tokio::main]
async fn main() -> ipc::Result<()> {
    if std::env::var("RUST_LOG").ok().is_none() {
        std::env::set_var("RUST_LOG", "info");
    }
    pretty_env_logger::init();

    let mut info = ipc::worker::read_stdin_connect()?;
    if let Some(connect) = info.take() {
        info!("Worker stdin {:?}", connect);
        ipc::worker::start(connect).await?;
    }
    Ok(())
}
