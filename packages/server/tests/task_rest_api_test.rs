mod common;

use alle_server::AppContext;
use common::*;

// Integration test with PostgreSQL (requires Docker)
#[tokio::test]
#[ignore] // Run with: cargo test -- --ignored --test-threads=1
async fn test_task_crud_postgres() {
    // Arrange
    let db = setup_test_db(TestDatabase::Postgres).await.unwrap();
    let ctx = AppContext::new(db.clone());

    // Act
    let task = ctx
        .task_repository
        .create("Postgres test".to_string())
        .await
        .unwrap();

    // Assert
    assert_eq!(task.title, "Postgres test");

    // Cleanup
    teardown_test_db(&db).await.unwrap();
}

// Integration test with MySQL (requires Docker)
#[tokio::test]
#[ignore] // Run with: cargo test -- --ignored --test-threads=1
async fn test_task_crud_mysql() {
    // Arrange
    let db = setup_test_db(TestDatabase::MySQL).await.unwrap();
    let ctx = AppContext::new(db.clone());

    // Act
    let task = ctx
        .task_repository
        .create("MySQL test".to_string())
        .await
        .unwrap();

    // Assert
    assert_eq!(task.title, "MySQL test");

    // Cleanup
    teardown_test_db(&db).await.unwrap();
}
