# Development

## Setup

1. Copy environment configuration:
```bash
cp .env.example .env
```

2. Start development server:
```bash
cargo run
```

Server starts at `http://localhost:8000/graphql`.

## Running Tests

All tests:
```bash
cargo test
```

Unit tests only (fast, in-memory):
```bash
cargo test unit
```

Integration tests (with real databases via testcontainers):
```bash
cargo test integration
```

Specific test:
```bash
cargo test test_create_task
```

With output:
```bash
cargo test -- --nocapture
```

Note: Integration tests automatically start Docker containers using testcontainers. No manual Docker setup required.

## Code Quality

Format code:
```bash
cargo fmt
```

Lint:
```bash
cargo clippy
```

Security audit:
```bash
cargo audit
```

## Hot Reload

Install cargo-watch:
```bash
cargo install cargo-watch
```

Run with auto-reload:
```bash
cargo watch -x run
```
