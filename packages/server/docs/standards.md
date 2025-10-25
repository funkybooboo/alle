# Server Coding Standards

Rust + Tokio standards for the Alle backend.

## Core Principles

- **Small Modules**: Focused, single responsibility modules
- **Portability**: Extract logic to libraries when possible
- **Dependency Injection**: Use traits for dependencies
- **Always Test**: Co-locate tests; 80%+ coverage for critical paths
- **Minimize Mocks**: Use test implementations; only mock external services

## Rust Standards

### Naming

- **Types**: PascalCase (`TodoItem`, `UserService`)
- **Functions**: snake_case (`get_todo`, `create_user`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_CONNECTIONS`)
- **Modules**: snake_case (`user_service`, `date_utils`)

### Type Safety

- **No unwrap()**: Use proper error handling with `?`
- **Result/Option**: Always use for fallible operations
- **Newtype Pattern**: For type safety (e.g., `UserId(i32)`, `TodoId(i32)`)

```rust
// Good: Proper error handling
async fn get_todo(id: TodoId) -> Result<Todo, TodoError> {
    let todo = db::find_todo(id).await?;
    Ok(todo)
}

// Bad: Using unwrap
async fn get_todo(id: TodoId) -> Todo {
    db::find_todo(id).await.unwrap() // Don't do this
}
```

## Error Handling

Use `thiserror` for custom errors with context:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum TodoError {
    #[error("Todo not found: {0}")]
    NotFound(TodoId),

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
}
```

## Async/Await

- **Tokio Runtime**: Use Tokio for async
- **spawn_blocking**: For CPU-intensive tasks
- **Channels**: Use `tokio::sync::mpsc` for message passing

```rust
// Good: Async I/O
async fn fetch_user(id: UserId) -> Result<User, Error> {
    db::query_user(id).await
}

// Good: CPU-intensive work
async fn process_data(data: Vec<u8>) -> Result<ProcessedData, Error> {
    task::spawn_blocking(move || heavy_computation(data)).await?
}
```

## Dependency Injection

Use trait-based injection for testability:

```rust
#[async_trait]
pub trait TodoRepository {
    async fn find(&self, id: TodoId) -> Result<Option<Todo>, Error>;
    async fn save(&self, todo: &Todo) -> Result<(), Error>;
}

pub struct TodoService<R: TodoRepository> {
    repository: R,
}

impl<R: TodoRepository> TodoService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_todo(&self, id: TodoId) -> Result<Todo, TodoError> {
        self.repository
            .find(id)
            .await?
            .ok_or(TodoError::NotFound(id))
    }
}

// Test implementation (not a mock)
struct InMemoryTodoRepository {
    todos: Arc<Mutex<HashMap<TodoId, Todo>>>,
}

#[async_trait]
impl TodoRepository for InMemoryTodoRepository {
    async fn find(&self, id: TodoId) -> Result<Option<Todo>, Error> {
        Ok(self.todos.lock().unwrap().get(&id).cloned())
    }

    async fn save(&self, todo: &Todo) -> Result<(), Error> {
        self.todos.lock().unwrap().insert(todo.id, todo.clone());
        Ok(())
    }
}
```

## Testing

### Principles

- **Minimize Mocks**: Use test implementations over mocking frameworks
- **Real Data**: Test with real data structures and business logic
- **Only Mock**: External HTTP APIs and third-party systems

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_todo_validation() {
        let result = validate_todo_title("Valid");
        assert!(result.is_ok());

        let result = validate_todo_title("");
        assert!(result.is_err());
    }
}
```

### Async Tests

```rust
#[tokio::test]
async fn test_with_real_implementation() {
    let repo = InMemoryTodoRepository::new();
    let service = TodoService::new(repo);

    // Create
    let todo = Todo::new(TodoId(1), "Test");
    service.save_todo(&todo).await.unwrap();

    // Retrieve
    let found = service.get_todo(TodoId(1)).await.unwrap();
    assert_eq!(found.title, "Test");
}

// Only mock external services
#[tokio::test]
async fn test_external_api() {
    let mut mock_server = mockito::Server::new();
    let mock = mock_server
        .mock("GET", "/api/todos")
        .with_status(200)
        .create();

    let client = ExternalClient::new(&mock_server.url());
    client.fetch_todos().await.unwrap();
    mock.assert();
}
```

## Security

- **Input Validation**: Use `validator` crate; validate all input
- **Passwords**: Use argon2 for hashing
- **Secrets**: Store in environment variables; never commit
- **SQL Injection**: Use parameterized queries with sqlx

```rust
use validator::Validate;

#[derive(Validate)]
pub struct CreateTodoRequest {
    #[validate(length(min = 1, max = 500))]
    pub title: String,
}
```

## Logging

Use `tracing` for structured logging:

```rust
use tracing::{info, error, instrument};

#[instrument(skip(db), fields(todo_id = ?id))]
async fn process_todo(db: &Database, id: TodoId) -> Result<(), Error> {
    info!("Processing todo");

    match db.process(id).await {
        Ok(_) => {
            info!("Success");
            Ok(())
        }
        Err(e) => {
            error!("Failed: {}", e);
            Err(e)
        }
    }
}
```

## Performance

- **Profile First**: Always profile before optimizing
- **Benchmarks**: Use `criterion` for critical paths
- **Connection Pools**: For databases
- **Timeouts**: Implement for external calls

## Documentation

```rust
/// Represents a todo item.
///
/// # Examples
///
/// ```
/// let todo = Todo::new(TodoId(1), "Buy milk");
/// assert_eq!(todo.title, "Buy milk");
/// ```
pub struct Todo {
    pub id: TodoId,
    pub title: String,
}
```

## File Organization

```
src/
├── main.rs          # Entry point
├── lib.rs           # Library root
├── handlers/        # HTTP handlers
├── models/          # Domain models
├── services/        # Business logic
├── repositories/    # Data access
├── db/              # Database utilities
├── middleware/      # HTTP middleware
├── errors/          # Error types
└── utils/           # Utilities
```

## Dependencies

- **Minimal**: Only add necessary dependencies
- **Security**: Run `cargo audit` regularly
- **Feature Flags**: For optional functionality

```toml
[dependencies]
tokio = { version = "1.40", features = ["full"] }
axum = "0.7"
sqlx = { version = "0.8", features = ["runtime-tokio", "postgres"] }
thiserror = "1.0"
tracing = "0.1"
validator = { version = "0.18", features = ["derive"] }
```

## Reference Standards

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Tokio Documentation](https://tokio.rs/tokio/tutorial)
