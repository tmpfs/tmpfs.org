```
cargo check --features=supervisor --bin=supervisor
cargo check --features=worker --bin=worker
```

```
cargo build --bin=worker --features=worker && cargo run --features=supervisor
```
