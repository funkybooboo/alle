# Testing Guide

## Test Structure

```
tests/
├── lib.rs                          # Test crate root
├── common/                         # Shared test utilities
│   ├── mod.rs                      # Re-exports
│   ├── db.rs                       # Database setup (testcontainers)
│   ├── assertions.rs               # Custom assertions
│   └── factories/
│       ├── mod.rs
│       └── task_factory.rs         # Task creation helpers
├── domains/                        # Domain tests (feature-based)
│   └── tasks/
│       ├── unit/                   # Fast, isolated unit tests
│       │   ├── mod.rs
│       │   ├── repository_unit_test.rs
│       │   └── queries_unit_test.rs
│       ├── integration/            # Tests with real databases
│       │   ├── mod.rs
│       │   ├── database_integration_test.rs
│       │   └── graphql_integration_test.rs
│       └── system/                 # End-to-end HTTP tests
│           ├── mod.rs
│           └── graphql_system_test.rs
└── infrastructure/                 # Infrastructure tests
    └── database/
        └── mod.rs
```

## Running Tests

### All Tests
```bash
cargo test
```

### Unit Tests Only
Fast, isolated tests using in-memory database:

```bash
# All unit tests
cargo test --lib domains::tasks::unit

# Specific unit test
cargo test test_create_task
```

### Integration Tests Only
Tests with real databases (PostgreSQL, MySQL, SQLite):

```bash
# All integration tests
cargo test --lib domains::tasks::integration

# Specific database
cargo test test_task_crud_postgres
cargo test test_task_crud_mysql
cargo test test_task_crud_sqlite
```

### System Tests
End-to-end tests with full server (currently ignored):

```bash
# Run system tests
cargo test --lib domains::tasks::system -- --ignored

# Specific system test
cargo test test_system_graphql_query_tasks -- --ignored
```

### Test Filtering
```bash
# Run all tests matching a pattern
cargo test graphql

# Run with output
cargo test -- --nocapture

# Run in verbose mode
cargo test -- --verbose
```

## Architecture

### Domain-Driven Structure

Tests are organized by domain (feature), not by technical layer:

```
domains/tasks/
├── unit/          # Business logic tests
├── integration/   # Database integration tests
└── system/        # End-to-end API tests
```

**Benefits:**
- All task-related tests in one place
- Easy to find and understand feature scope
- Scales as you add more domains (users, projects, etc.)

### GraphQL-Only API

The application uses GraphQL exclusively:
- No REST endpoints
- Single `/graphql` endpoint
- Type-safe queries and mutations
- GraphQL Playground for testing

## Writing Tests

### Unit Tests (Fast, Isolated)

Test business logic with in-memory database:

```rust
// tests/domains/tasks/unit/repository_unit_test.rs
use crate::common::*;

#[tokio::test]
async fn test_create_task() {
    let ctx = test_app_context().await;

    let task = ctx.task_repository
        .create("Test task".to_string())
        .await
        .unwrap();

    assert_eq!(task.title, "Test task");
    assert_eq!(task.completed, false);
}
```

```rust
// tests/domains/tasks/unit/queries_unit_test.rs
use crate::common::*;
use alle_server::graphql::create_schema;
use async_graphql::Request;

#[tokio::test]
async fn test_graphql_query_tasks() {
    let ctx = test_app_context().await;
    let schema = create_schema(ctx);

    let query = r#"query { tasks { id title completed } }"#;
    let response = schema.execute(Request::new(query)).await;

    assert!(response.errors.is_empty());
}
```

### Integration Tests (Real Databases)

Test with PostgreSQL, MySQL, or SQLite using testcontainers:

```rust
// tests/domains/tasks/integration/database_integration_test.rs
use crate::common::db::{setup_postgres_container, teardown_test_db};
use alle_server::AppContext;

#[tokio::test]
async fn test_task_crud_postgres() {
    // Automatically starts PostgreSQL container
    let (db, _container) = setup_postgres_container().await.unwrap();
    let ctx = AppContext::new(db.clone());

    // Test CRUD operations
    let task = ctx.task_repository
        .create("Test".to_string())
        .await
        .unwrap();

    assert_eq!(task.title, "Test");

    teardown_test_db(&db).await.unwrap();
    // Container automatically stopped when _container is dropped
}
```

### System Tests (End-to-End HTTP)

Test full HTTP stack with GraphQL:

```rust
// tests/domains/tasks/system/graphql_system_test.rs
use reqwest::Client;
use serde_json::json;

#[tokio::test]
#[ignore] // Enable when server supports programmatic startup
async fn test_system_graphql_query_tasks() {
    let (base_url, _server) = start_test_server().await;
    let client = Client::new();

    let query = json!({
        "query": "query { tasks { id title completed } }"
    });

    let response = client
        .post(&format!("{}/graphql", base_url))
        .json(&query)
        .send()
        .await
        .expect("Failed to send request");

    assert!(response.status().is_success());
}
```

## Test Utilities

### Database Setup

#### In-Memory (Unit Tests)
```rust
use crate::common::*;

let ctx = test_app_context().await;  // Fast, isolated
```

#### PostgreSQL (Integration Tests)
```rust
use crate::common::db::setup_postgres_container;

let (db, _container) = setup_postgres_container().await.unwrap();
// Container auto-starts and stops
```

#### MySQL (Integration Tests)
```rust
use crate::common::db::setup_mysql_container;

let (db, _container) = setup_mysql_container().await.unwrap();
```

#### SQLite (Integration Tests)
```rust
use crate::common::db::setup_sqlite_container;

let db = setup_sqlite_container().await.unwrap();
```

### Task Factory

Create test data easily:

```rust
use crate::common::*;

let factory = task_factory().await;

// Create single task
let task = factory.create("Test task").await;

// Create completed task
let completed = factory.create_completed("Done task").await;

// Create multiple tasks
let tasks = factory.create_many(&["Task 1", "Task 2"]).await;

// Access repository
let all = factory.ctx.task_repository.find_all().await.unwrap();
```

### Custom Assertions

```rust
use crate::common::*;

// Assert task fields
assert_task_eq(&task, "Expected title", false);

// Assert task exists
assert_task_exists(found_task, "Expected title");

// Assert task not found
assert_task_not_found(not_found_task);

// Assert collection count
assert_count(&tasks, 3);
```

## Adding Tests for New Domains

When adding a new domain (e.g., `users`):

### 1. Create Test Structure
```bash
tests/domains/users/
├── unit/
│   ├── mod.rs
│   ├── repository_unit_test.rs
│   └── queries_unit_test.rs
├── integration/
│   ├── mod.rs
│   └── database_integration_test.rs
└── system/
    ├── mod.rs
    └── graphql_system_test.rs
```

### 2. Create Factory (Optional)
```rust
// tests/common/factories/user_factory.rs
pub struct UserFactory {
    pub ctx: Arc<AppContext>,
}

impl UserFactory {
    pub async fn create(&self, name: &str) -> entity::Model {
        self.ctx.user_repository
            .create(name.to_string())
            .await
            .expect("Failed to create user")
    }
}
```

### 3. Write Tests
Follow the same pattern as tasks tests.

## Test Coverage

### Current Coverage

**Unit Tests:**
- Repository: 16 tests
- GraphQL Queries/Mutations: 10 tests

**Integration Tests:**
- Database (SQLite, PostgreSQL, MySQL): 3 tests
- GraphQL with databases: 6 tests

**System Tests (Ignored):**
- GraphQL end-to-end: 4 tests

**Total:** 47 tests (43 running, 4 ignored)

## Best Practices

### General
1. Use factories for test data creation
2. Use custom assertions for readable tests
3. Test one thing per test function
4. Use descriptive names: `test_create_task_with_empty_title_fails`
5. Keep tests independent

### Unit vs Integration vs System
6. **Unit tests**: Fast, in-memory, test business logic
   - Run on every commit
   - Should complete in milliseconds
   - Use `test_app_context()` or `fresh_in_memory_db()`

7. **Integration tests**: Real databases, test data persistence
   - Use testcontainers (auto-start Docker)
   - Test database-specific behavior
   - Takes seconds (container startup)

8. **System tests**: Full HTTP stack, end-to-end
   - Test complete request/response cycle
   - Currently ignored (requires server startup support)
   - Use for smoke testing deployments

### Testcontainers
9. Containers auto-start and stop (no manual docker-compose)
10. Keep `_container` variable in scope to prevent early cleanup
11. Use `teardown_test_db()` for proper cleanup
12. Random ports (no conflicts)

## Testcontainers vs Manual Docker

### Testcontainers (Current)
- Automatic container management
- No port conflicts
- Isolated per test
- Works in CI
- Cleanup guaranteed

### Manual Docker Compose (Legacy)
- Requires `docker-compose.test.yml`
- Manual start/stop
- Fixed ports (conflicts possible)
- Still available if needed

## CI Integration

Tests run automatically in GitHub Actions (`.github/workflows/server-ci.yml`):

```yaml
unit-tests:
  - cargo test --lib domains::tasks::unit

integration-tests:
  - cargo test --lib domains::tasks::integration
  # Testcontainers auto-manages Docker
```

## Quick Reference

```bash
# All tests
cargo test

# Unit tests only (fast)
cargo test --lib domains::tasks::unit

# Integration tests (with Docker)
cargo test --lib domains::tasks::integration

# System tests (ignored)
cargo test --lib domains::tasks::system -- --ignored

# Specific test
cargo test test_create_task

# With output
cargo test -- --nocapture

# Verbose
cargo test -- --verbose
```

## Troubleshooting

### Docker Not Available
```bash
# Check Docker
docker ps

# Start Docker (varies by OS)
sudo systemctl start docker  # Linux
open -a Docker              # macOS
```

### Slow Integration Tests
- First run downloads container images (one-time)
- Subsequent runs are faster (cached)
- Use unit tests for fast feedback

### Tests Hanging
- Check Docker: `docker ps`
- Try: `cargo test -- --nocapture`
- Check for connection leaks

### Container Cleanup
Testcontainers auto-cleans, but if needed:
```bash
docker ps -a | grep testcontainers | awk '{print $1}' | xargs docker rm
docker image prune
```
