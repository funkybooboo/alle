# Alle Server

The Rust backend for Alle, a minimalist to-do list and planning application. Built with Tokio's async runtime for high-performance concurrent operations.

## Overview

The Alle server is currently in early development. It provides the backend API and business logic for task management, user accounts, data persistence, and synchronization. The server is designed to be fast, reliable, and capable of handling many concurrent connections efficiently.

## Tech Stack

- **Rust 2024 Edition** - Modern, safe systems programming language
- **Tokio** - Asynchronous runtime for concurrent operations
- **Architecture** - Async-first design for high concurrency

### Current Dependencies

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

**Tokio** provides:
- Multi-threaded async runtime
- Efficient I/O handling (networking, file operations)
- Task scheduling and concurrency primitives
- Cross-platform support (Linux, macOS, Windows)

### Planned Dependencies

As development progresses, the following crates will likely be integrated:

- **Web Framework**: `axum` or `actix-web` for HTTP routing and middleware
- **Serialization**: `serde` and `serde_json` for JSON handling
- **Database**: `sqlx` or `diesel` for database access with PostgreSQL
- **Error Handling**: `thiserror` or `anyhow` for structured error types
- **Logging**: `tracing` for structured logging and observability
- **Configuration**: `config` or `figment` for environment-based configuration
- **Authentication**: `jsonwebtoken` for JWT-based auth
- **Password Hashing**: `argon2` or `bcrypt` for secure password storage
- **Testing**: `mockall` or `mockito` for mocking in tests

## Getting Started

### Prerequisites

- **Rust** (latest stable version) - [Install via rustup](https://rustup.rs)
- **Cargo** - Comes with Rust installation

### Building the Server

```bash
# Navigate to the server directory
cd packages/server

# Build in debug mode
cargo build

# Build optimized release version
cargo build --release
```

Build artifacts are placed in `target/debug/` or `target/release/`.

### Running the Server

```bash
# Run in development mode
cargo run

# Run optimized release build
cargo run --release
```

Currently outputs: `Hello from Tokio!`

### Development Workflow

```bash
# Check code without building
cargo check

# Run with verbose output
cargo run --verbose

# Clean build artifacts
cargo clean

# Update dependencies
cargo update

# Format code according to Rust style
cargo fmt

# Run linter/static analysis
cargo clippy
```

## Testing

The server uses Rust's built-in test framework with Tokio's async test support.

### Running Tests

```bash
# Run all tests
cargo test

# Run with verbose output
cargo test --verbose

# Run specific test
cargo test simple_async_test

# Run tests with output (show println! statements)
cargo test -- --nocapture

# Run tests in single-threaded mode
cargo test -- --test-threads=1
```

### Writing Tests

Tests are written using Rust's `#[cfg(test)]` attribute and Tokio's `#[tokio::test]` macro for async tests:

```rust
#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn test_async_operation() {
        let result = some_async_function().await;
        assert_eq!(result, expected_value);
    }

    #[test]
    fn test_sync_operation() {
        let result = some_sync_function();
        assert_eq!(result, expected_value);
    }
}
```

### Test Organization

- **Unit tests**: Place in the same file as the code they test within `#[cfg(test)] mod tests`
- **Integration tests**: Place in `tests/` directory (to be created)
- **Async tests**: Use `#[tokio::test]` attribute for async test functions
- **Sync tests**: Use standard `#[test]` attribute

## Project Structure

Current structure (minimal, early development):

```
packages/server/
├── Cargo.toml          # Project manifest and dependencies
├── Cargo.lock          # Locked dependency versions
├── .gitignore          # Ignore build artifacts (/target)
├── README.md           # This file
└── src/
    └── main.rs         # Entry point with Tokio runtime setup
```

Expected future structure as the project grows:

```
packages/server/
├── Cargo.toml
├── Cargo.lock
├── .gitignore
├── README.md
├── .env.example        # Example environment variables
├── migrations/         # Database migrations
│   └── *.sql
├── src/
│   ├── main.rs         # Entry point and server initialization
│   ├── lib.rs          # Shared library code
│   ├── config.rs       # Configuration management
│   ├── errors.rs       # Error types and handling
│   ├── routes/         # API route definitions
│   │   ├── mod.rs
│   │   ├── tasks.rs
│   │   ├── lists.rs
│   │   └── auth.rs
│   ├── handlers/       # Request handlers
│   │   ├── mod.rs
│   │   ├── task_handlers.rs
│   │   └── user_handlers.rs
│   ├── models/         # Data models and business logic
│   │   ├── mod.rs
│   │   ├── task.rs
│   │   ├── user.rs
│   │   └── list.rs
│   ├── db/             # Database layer
│   │   ├── mod.rs
│   │   ├── pool.rs
│   │   └── queries.rs
│   ├── middleware/     # HTTP middleware
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   └── logging.rs
│   └── utils/          # Utility functions
│       └── mod.rs
└── tests/              # Integration tests
    └── api_tests.rs
```

## Architecture

### Async Runtime

The server uses Tokio's multi-threaded async runtime, configured with the `#[tokio::main]` attribute:

```rust
#[tokio::main]
async fn main() {
    // Server initialization and startup
}
```

This provides:
- Efficient handling of many concurrent connections
- Non-blocking I/O operations
- Task scheduling and work-stealing thread pool
- Timer and delay support

### Planned API Design

The server will expose a RESTful API for the Alle frontend:

#### Task Endpoints
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/move` - Move task (drag-and-drop)

#### List Endpoints
- `GET /api/lists` - Get all lists
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list

#### User Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/users/me` - Get current user profile

#### Sync Endpoints
- `POST /api/sync` - Sync offline changes
- `GET /api/sync/status` - Get sync status

### Planned Data Models

#### Task
```rust
struct Task {
    id: Uuid,
    user_id: Uuid,
    list_id: Option<Uuid>,
    title: String,
    description: Option<String>,
    completed: bool,
    position: i32,
    due_date: Option<NaiveDate>,
    recurring: Option<RecurrencePattern>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}
```

#### List
```rust
struct List {
    id: Uuid,
    user_id: Uuid,
    name: String,
    color: Option<String>,
    position: i32,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}
```

#### User
```rust
struct User {
    id: Uuid,
    email: String,
    password_hash: String,
    display_name: Option<String>,
    created_at: DateTime<Utc>,
    last_login: Option<DateTime<Utc>>,
}
```

### Error Handling

Planned error handling strategy:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ServerError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Validation error: {0}")]
    Validation(String),
}
```

## Configuration

### Environment Variables (Planned)

The server will support configuration through environment variables:

```bash
# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Database
DATABASE_URL=postgres://user:password@localhost/alle_db
DATABASE_MAX_CONNECTIONS=10

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400  # 24 hours

# Logging
RUST_LOG=info
```

### Configuration File (Planned)

A `config.toml` or similar configuration file for non-sensitive settings:

```toml
[server]
host = "0.0.0.0"
port = 8080

[database]
max_connections = 10
timeout = 30

[features]
offline_sync = true
recurring_tasks = true
```

## Database

### Planned Database Schema

The server will use PostgreSQL for data persistence:

**Tables:**
- `users` - User accounts
- `lists` - Task lists/projects
- `tasks` - Individual to-do items
- `recurrence_patterns` - Recurring task definitions
- `task_history` - Change history for undo/redo
- `sessions` - User sessions/auth tokens

### Migrations

Database migrations will be managed using `sqlx migrate` or similar:

```bash
# Create new migration
sqlx migrate add create_users_table

# Run migrations
sqlx migrate run

# Revert last migration
sqlx migrate revert
```

## Performance Considerations

### Async Design Benefits
- Non-blocking I/O allows handling thousands of concurrent connections
- Efficient resource utilization (small memory footprint per connection)
- Work-stealing scheduler maximizes CPU usage

### Planned Optimizations
- Database connection pooling
- Query result caching (Redis or in-memory)
- Batch operations for task updates
- Efficient indexing on frequently queried fields
- Prepared statement reuse

## Security

### Planned Security Measures
- **Password hashing**: Argon2 or bcrypt with appropriate cost factors
- **JWT authentication**: Short-lived access tokens with refresh tokens
- **SQL injection prevention**: Parameterized queries via sqlx
- **CORS configuration**: Restrict origins to frontend domain
- **Rate limiting**: Prevent brute force and DoS attacks
- **Input validation**: Validate all user input
- **HTTPS only**: TLS/SSL in production

## CI/CD

The server is integrated with GitHub Actions for continuous integration:

**Workflow** (`.github/workflows/server.yml`):
- Runs on push and pull requests to `main`
- Sets up Rust toolchain
- Runs `cargo build --verbose`
- Runs `cargo test --verbose`

### Local Pre-Commit Checks

Before committing, ensure:
```bash
# Format code
cargo fmt

# Check for errors
cargo clippy

# Run tests
cargo test

# Ensure it builds
cargo build --release
```

## Development Status

**Current State:** Early development / skeleton phase
- Basic Tokio runtime setup
- Simple async test example
- CI/CD pipeline configured
- No HTTP server implementation yet
- No database layer yet
- No API endpoints yet

**Next Steps:**
1. Integrate web framework (axum or actix-web)
2. Set up database connection and migrations
3. Implement authentication system
4. Create task CRUD endpoints
5. Add logging and error handling
6. Implement business logic for recurring tasks and rollover
7. Add comprehensive test coverage
8. Set up configuration management

## Contributing

When contributing to the server:

1. Follow Rust's official style guide (enforced by `cargo fmt`)
2. Add tests for new functionality
3. Document public APIs with doc comments (`///`)
4. Handle errors explicitly (avoid `.unwrap()` in production code)
5. Use async/await for I/O operations
6. Keep functions small and focused
7. Update this README when adding major features

### Code Style

```rust
// Good: Explicit error handling
let user = get_user(id).await?;

// Bad: Unwrapping in production code
let user = get_user(id).await.unwrap();

// Good: Descriptive names
async fn create_task_and_notify_user(task: Task, user_id: Uuid) -> Result<()>

// Bad: Unclear abbreviations
async fn cr_tsk_ntfy(t: Task, uid: Uuid) -> Result<()>
```

## Resources

- [Tokio Documentation](https://tokio.rs/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Rust Async Book](https://rust-lang.github.io/async-book/)
- [Cargo Documentation](https://doc.rust-lang.org/cargo/)
- [API Guidelines](https://rust-lang.github.io/api-guidelines/)
