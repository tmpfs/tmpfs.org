use psup::{Result, worker};

#[tokio::main]
async fn main() -> Result<()> {
    if std::env::var("RUST_LOG").ok().is_none() {
        std::env::set_var("RUST_LOG", "info");
    }
    pretty_env_logger::init();

    let mut info = worker::read()?;
    if let Some(connect) = info.take() {
        worker::connect(connect).await?;
    }
    Ok(())
}
