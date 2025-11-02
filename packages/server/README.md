# Alle Server

Rust backend with GraphQL API, built on Tokio async runtime.

**Features:** Interactive docs (GraphQL Playground), SeaORM, migrations, comprehensive tests, Docker support

## Quick Start

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh  # Install Rust
cp .env.example .env && cargo run  # → http://localhost:8000
```

**APIs:** [GraphQL Playground](http://localhost:8000/graphql)

## Development

```bash
cargo install cargo-watch cargo-audit cargo-deny  # Dev tools
cargo watch -x run  # Hot reload
cargo test  # Tests
cargo fmt && cargo clippy -- -D warnings  # Quality
```

**Stack:** Tokio • Hyper • async-graphql • utoipa • SeaORM • SQLite

## Structure

```
src/
├── domains/        # Business logic & repositories
├── api/            # GraphQL endpoints
├── infrastructure/ # Database, config, middleware
└── main.rs         # Entry point
```

## Testing

```bash
cargo test  # All tests (65 passed, 4 ignored)
cargo test --test <name>  # Specific suite
cargo watch -c -x test  # Watch mode
```

## Deployment

```bash
cargo build --release  # Production build
docker build -t alle-server .  # Docker
docker-compose up -d  # Compose
```

## Configuration

Prefix env vars with `ALLE_SERVER_`:
```bash
ALLE_SERVER_DATABASE_URL=sqlite:./alle.db?mode=rwc
ALLE_SERVER_PORT=8000
```

## Pre-Commit

```bash
cargo fmt && cargo clippy -- -D warnings && cargo test
```

## License

GPL-3.0-or-later
