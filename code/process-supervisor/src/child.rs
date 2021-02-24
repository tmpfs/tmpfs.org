mod ipc;

#[tokio::main]
async fn main() -> ipc::Result<()> {
    let mut info = ipc::child::read_stdin_connect()?;
    if let Some(connect) = info.take() {
        ipc::child::start(connect).await?;
        loop {}
    }
    Ok(())
}
