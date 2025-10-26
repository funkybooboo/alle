# Alle Server

Modern Rust backend for Alle - a minimalist to-do list app.

Built with Tokio async runtime, featuring dual REST and GraphQL APIs, comprehensive testing, and interactive documentation.

## Features

- **Dual API Support** - REST and GraphQL endpoints
- **Interactive Docs** - Swagger UI and GraphQL Playground
- **Type-Safe Database** - SeaORM with automatic migrations
- **Comprehensive Testing** - 26 tests with factories and assertions
- **Hot Reload** - Development server with auto-restart
- **Docker Ready** - Multi-stage builds and compose files
- **Security First** - Dependency auditing and license enforcement

## Quick Start

```bash
# Prerequisites
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Setup
cp .env.example .env
cargo run

# Server starts at http://localhost:8000
```

**Explore the APIs:**
- Swagger UI: http://localhost:8000/swagger-ui/
- GraphQL Playground: http://localhost:8000/graphql
- REST API: http://localhost:8000/api/tasks

## Development

```bash
# Install dev tools
cargo install cargo-watch cargo-audit cargo-deny

# Start with hot reload
cargo watch -x run

# Run tests
cargo test

# Code quality
cargo fmt && cargo clippy -- -D warnings
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Tokio async |
| HTTP | Hyper |
| GraphQL | async-graphql |
| REST Docs | utoipa + Swagger UI |
| Database | SeaORM + SQLite |
| Testing | Tokio test + in-memory DB |

## Architecture

```
src/
├── main.rs              # Entry point, server setup
├── lib.rs               # Library exports
├── app_context.rs       # Dependency injection
├── db.rs                # Database connection
├── entities/            # Database models (SeaORM)
├── repositories/        # Data access layer
│   ├── repository.rs    # Base repository
│   └── task_repository.rs
├── graphql/             # GraphQL API
│   ├── schema.rs        # Root query/mutation
│   ├── types.rs         # GraphQL types
│   └── task_queries.rs  # Task queries/mutations
├── handlers/            # REST API
│   └── task_handlers.rs
└── migration/           # Database migrations
```

## Documentation

### API Documentation
- **[api.md](docs/api.md)** - REST and GraphQL reference
- **[openapi.yaml](docs/openapi.yaml)** - OpenAPI 3.0 specification
- **[Swagger UI](http://localhost:8000/swagger-ui/)** - Interactive REST docs
- **[GraphQL Playground](http://localhost:8000/graphql)** - Interactive GraphQL IDE

### Development Guides
- **[configuration.md](docs/configuration.md)** - Environment variables
- **[development.md](docs/development.md)** - Local setup and testing
- **[migrations.md](docs/migrations.md)** - Database migrations
- **[adding-entities.md](docs/adding-entities.md)** - Adding new entities
- **[testing.md](docs/testing.md)** - Testing guide

### Operations
- **[deployment.md](docs/deployment.md)** - Production deployment
- **[troubleshooting.md](docs/troubleshooting.md)** - Common issues

## Testing

```bash
# Run all tests (26 tests)
cargo test

# Run specific test suite
cargo test --test task_repository_test
cargo test --test task_graphql_test

# Watch mode
cargo watch -c -x test

# Integration tests with Docker
docker-compose -f docker-compose.test.yml up -d
cargo test -- --ignored --test-threads=1
docker-compose -f docker-compose.test.yml down
```

**Test Coverage:**
- 16 repository layer tests
- 10 GraphQL API tests
- 2 Docker integration tests (PostgreSQL, MySQL)

## Deployment

### Production Build

```bash
cargo build --release
./target/release/alle-server
```

### Docker

```bash
docker build -t alle-server .
docker run -p 8000:8000 --env-file .env alle-server
```

### Docker Compose

```bash
docker-compose up -d
```

See [deployment.md](docs/deployment.md) for details.

## Configuration

All environment variables are prefixed with `ALLE_SERVER_`:

```bash
ALLE_SERVER_DATABASE_URL=sqlite:./alle.db?mode=rwc
ALLE_SERVER_HOST=0.0.0.0
ALLE_SERVER_PORT=8000
ALLE_SERVER_ENV=development
```

See [configuration.md](docs/configuration.md) for all options.

## Code Quality

### Pre-Commit

```bash
cargo fmt && cargo clippy -- -D warnings && cargo test
```

### Security

```bash
cargo audit              # Vulnerability scanning
cargo deny check         # License and security policies
```

**License Policy:** GPL-3.0-or-later. Dependencies must use approved licenses (MIT, Apache-2.0, BSD, ISC).

## Contributing

See [../../docs/contributing.md](../../docs/contributing.md) for guidelines on:
- Using TODO/FIXME comments (auto-creates GitHub issues)
- Development workflow
- Code standards

**Quick Start:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and quality checks
5. Submit a pull request

## License

GPL-3.0-or-later

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Tokio Documentation](https://tokio.rs/)
- [SeaORM Guides](https://www.sea-ql.org/SeaORM/)
- [async-graphql Book](https://async-graphql.github.io/async-graphql/)
