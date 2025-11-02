use alle_server::infrastructure::context::AppContext;
use alle_server::infrastructure::Migrator;
use sea_orm::Database;
use sea_orm_migration::MigratorTrait;

async fn create_test_db() -> sea_orm::DatabaseConnection {
    let db = Database::connect("sqlite::memory:")
        .await
        .expect("Failed to connect");
    Migrator::up(&db, None)
        .await
        .expect("Failed to run migrations");
    db
}

#[tokio::test]
async fn test_app_context_creation() {
    let db = create_test_db().await;
    let context = AppContext::new(db);

    // Verify the context was created successfully
    // The repositories should be accessible
    let _ = &context.task_repository;
}

#[tokio::test]
async fn test_app_context_task_repository_accessible() {
    let db = create_test_db().await;
    let context = AppContext::new(db);

    // Verify we can use the task repository
    let result = context.task_repository.find_all().await;
    assert!(result.is_ok(), "Should be able to query tasks");
    assert_eq!(result.unwrap().len(), 0, "Should start with no tasks");
}

#[tokio::test]
async fn test_app_context_repository_operations() {
    let db = create_test_db().await;
    let context = AppContext::new(db);

    // Create a task through the repository
    let task = context
        .task_repository
        .create("Test task".to_string(), chrono::Utc::now())
        .await
        .expect("Failed to create task");

    assert_eq!(task.title, "Test task");
    assert!(!task.completed);

    // Verify we can find it
    let all_tasks = context
        .task_repository
        .find_all()
        .await
        .expect("Failed to find tasks");

    assert_eq!(all_tasks.len(), 1);
    assert_eq!(all_tasks[0].title, "Test task");
}
