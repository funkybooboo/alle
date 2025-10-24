# Testing Guide

## Test Structure

```
tests/
├── common/                  # Shared test utilities
│   ├── mod.rs              # Re-exports
│   ├── db.rs               # Database setup utilities
│   ├── task_factory.rs     # Task creation helpers
│   └── assertions.rs       # Custom assertions
├── task_repository_test.rs # Repository layer tests
├── task_graphql_test.rs    # GraphQL API tests
└── task_rest_api_test.rs   # REST API integration tests
```

## Running Tests

### All Tests
```bash
cargo test
```

### Specific Test File
```bash
cargo test --test task_repository_test
cargo test --test task_graphql_test
```

### Single Test
```bash
cargo test test_create_task
```

### With Output
```bash
cargo test -- --nocapture
```

### Integration Tests (Docker)
```bash
# Start test databases
docker-compose -f docker-compose.test.yml up -d

# Run ignored tests
cargo test -- --ignored --test-threads=1

# Stop databases
docker-compose -f docker-compose.test.yml down
```

## Test Utilities

### Database Setup

#### Quick In-Memory Database
```rust
use common::*;

#[tokio::test]
async fn test_something() {
    let ctx = test_app_context().await;
    // Use ctx.task_repository
}
```

#### Task Factory
```rust
use common::*;

#[tokio::test]
async fn test_with_factory() {
    let factory = task_factory().await;

    // Create tasks
    let task = factory.create("Test task").await;
    let completed = factory.create_completed("Done task").await;
    let many = factory.create_many(&["Task 1", "Task 2"]).await;

    // Access repository
    factory.ctx.task_repository.find_all().await.unwrap();
}
```

### Custom Assertions

```rust
use common::*;

#[tokio::test]
async fn test_with_assertions() {
    let factory = task_factory().await;
    let task = factory.create("Test").await;

    // Assert task fields
    assert_task_eq(&task, "Test", false);

    // Assert task exists
    let found = factory.ctx.task_repository.find_by_id(task.id).await.unwrap();
    assert_task_exists(found, "Test");

    // Assert task not found
    let not_found = factory.ctx.task_repository.find_by_id(9999).await.unwrap();
    assert_task_not_found(not_found);

    // Assert collection count
    let all_tasks = factory.ctx.task_repository.find_all().await.unwrap();
    assert_count(&all_tasks, 1);
}
```

## Writing Tests

### Repository Tests

Test the repository layer directly:

```rust
mod common;
use common::*;

#[tokio::test]
async fn test_repository_method() {
    let ctx = test_app_context().await;

    let task = ctx.task_repository.create("Test".to_string()).await.unwrap();
    assert_task_eq(&task, "Test", false);
}
```

### GraphQL Tests

Test GraphQL queries and mutations:

```rust
mod common;
use common::*;
use alle_server::graphql::create_schema;
use async_graphql::Request;

#[tokio::test]
async fn test_graphql_query() {
    let ctx = test_app_context().await;
    let schema = create_schema(ctx);

    let query = r#"query { tasks { id title } }"#;
    let response = schema.execute(Request::new(query)).await;

    assert!(response.errors.is_empty());
}
```

## Adding Tests for New Entities

1. Create `tests/common/your_entity_factory.rs`:
```rust
pub struct YourEntityFactory {
    pub ctx: Arc<AppContext>,
}

impl YourEntityFactory {
    pub fn new(ctx: Arc<AppContext>) -> Self {
        Self { ctx }
    }

    pub async fn create(&self, name: &str) -> YourEntityModel {
        self.ctx.your_entity_repository
            .create(name.to_string())
            .await
            .expect("Failed to create entity")
    }
}
```

2. Create `tests/your_entity_repository_test.rs`:
```rust
mod common;
use common::*;

#[tokio::test]
async fn test_create_your_entity() {
    let ctx = test_app_context().await;
    let entity = ctx.your_entity_repository.create("Test".to_string()).await.unwrap();
    assert_eq!(entity.name, "Test");
}
```

3. Create `tests/your_entity_graphql_test.rs` for GraphQL tests

## Test Database Options

### In-Memory SQLite (Default)
Fast, isolated tests without external dependencies:
```rust
let db = fresh_in_memory_db().await;
```

### PostgreSQL (Docker Required)
```rust
#[tokio::test]
#[ignore]
async fn test_with_postgres() {
    let db = setup_test_db(TestDatabase::Postgres).await.unwrap();
    // Test code
    teardown_test_db(&db).await.unwrap();
}
```

### MySQL (Docker Required)
```rust
#[tokio::test]
#[ignore]
async fn test_with_mysql() {
    let db = setup_test_db(TestDatabase::MySQL).await.unwrap();
    // Test code
    teardown_test_db(&db).await.unwrap();
}
```

## Docker Test Databases

### Configuration

**PostgreSQL**
- Port: 5433
- Database: alle_test
- User: alle_test
- Password: test_password
- URL: `postgres://alle_test:test_password@localhost:5433/alle_test`

**MySQL**
- Port: 3307
- Database: alle_test
- User: alle_test
- Password: test_password
- URL: `mysql://alle_test:test_password@localhost:3307/alle_test`

### Environment Variables

Override defaults:
```bash
export TEST_DATABASE_URL_POSTGRES="postgres://user:pass@localhost:5433/testdb"
export TEST_DATABASE_URL_MYSQL="mysql://user:pass@localhost:3307/testdb"
```

## Test Coverage

### Current Coverage

- Repository layer: 16 tests
- GraphQL API: 10 tests
- REST API: 2 integration tests (ignored by default)

Total: 28 tests covering CRUD operations, edge cases, and error handling

## Best Practices

1. Use factories for test data creation
2. Use custom assertions for readable tests
3. Test one thing per test function
4. Use descriptive test names
5. Mark Docker tests with `#[ignore]`
6. Use `--test-threads=1` for integration tests
7. Clean up with `teardown_test_db()` for Docker tests
8. Don't clean up in-memory tests (automatic)

## Troubleshooting

### Port Conflicts
```bash
docker-compose -f docker-compose.test.yml down
# Or change ports in docker-compose.test.yml
```

### Database Not Ready
```bash
docker-compose -f docker-compose.test.yml ps
# Wait for "(healthy)" status
```

### Connection Errors
```bash
docker-compose -f docker-compose.test.yml logs
```
