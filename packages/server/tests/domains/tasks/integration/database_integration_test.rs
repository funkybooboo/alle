use crate::common::db::{
    setup_mysql_container, setup_postgres_container, setup_sqlite_container, teardown_test_db,
};
use alle_server::AppContext;

// Integration test with SQLite
#[tokio::test]
async fn test_task_crud_sqlite() {
    // Arrange - creates a file-based SQLite database
    let db = setup_sqlite_container().await.unwrap();
    let ctx = AppContext::new(db.clone());

    // Act
    let task = ctx
        .task_repository
        .create("SQLite test".to_string(), chrono::Utc::now())
        .await
        .unwrap();

    // Assert
    assert_eq!(task.title, "SQLite test");

    // Cleanup
    teardown_test_db(&db).await.unwrap();
}

// Integration test with PostgreSQL
// Docker containers are automatically started and stopped by testcontainers
#[tokio::test]
async fn test_task_crud_postgres() {
    // Arrange - automatically starts a PostgreSQL container
    let (db, _container) = setup_postgres_container().await.unwrap();
    let ctx = AppContext::new(db.clone());

    // Act
    let task = ctx
        .task_repository
        .create("Postgres test".to_string(), chrono::Utc::now())
        .await
        .unwrap();

    // Assert
    assert_eq!(task.title, "Postgres test");

    // Cleanup
    teardown_test_db(&db).await.unwrap();
    // Container is automatically stopped when _container is dropped
}

// Integration test with MySQL
// Docker containers are automatically started and stopped by testcontainers
#[tokio::test]
async fn test_task_crud_mysql() {
    // Arrange - automatically starts a MySQL container
    let (db, _container) = setup_mysql_container().await.unwrap();
    let ctx = AppContext::new(db.clone());

    // Act
    let task = ctx
        .task_repository
        .create("MySQL test".to_string(), chrono::Utc::now())
        .await
        .unwrap();

    // Assert
    assert_eq!(task.title, "MySQL test");

    // Cleanup
    teardown_test_db(&db).await.unwrap();
    // Container is automatically stopped when _container is dropped
}
