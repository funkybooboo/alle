# Development

## Setup

```bash
cp .env.example .env
cargo watch -x run
```

Server starts at `http://localhost:8000`.

## Running Tests

All tests:
```bash
cargo test
```

Specific test file:
```bash
cargo test --test task_repository_test
```

With output:
```bash
cargo test -- --nocapture
```

## Docker Integration Tests

```bash
docker-compose -f docker-compose.test.yml up -d
cargo test -- --ignored --test-threads=1
docker-compose -f docker-compose.test.yml down
```

## Code Quality

Format:
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

```bash
cargo install cargo-watch
cargo watch -x run
```
