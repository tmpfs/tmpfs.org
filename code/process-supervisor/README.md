```
cargo check --features=supervisor --bin=supervisor
cargo check --features=child --bin=child
```

```
cargo build --bin=child --features=child && cargo run --features=supervisor
```
