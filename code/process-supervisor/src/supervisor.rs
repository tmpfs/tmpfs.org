use tokio::sync::oneshot;

mod ipc;
use ipc::*;

#[tokio::main]
async fn main() -> ipc::Result<()> {
    println!("Start supervisor {}", SOCKET_PATH);

    let (tx, rx) = oneshot::channel::<()>();

    tokio::spawn(async move {
        ipc::server::start(SOCKET_PATH, tx).await
            .expect("Unable to start ipc server");
    });

    let _ = rx.await?;
    println!("Server is listening {}", SOCKET_PATH);

    for i in 0..2 {
        ipc::server::spawn_worker(i);
    }

    loop {}
}
