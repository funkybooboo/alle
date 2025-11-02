use alle_server::infrastructure::database::connection::establish_connection;

#[tokio::test]
async fn test_establish_sqlite_connection() {
    let result = establish_connection("sqlite::memory:").await;
    assert!(result.is_ok(), "Failed to establish SQLite connection");

    let db = result.unwrap();
    assert!(db.ping().await.is_ok(), "Failed to ping SQLite database");
}

#[tokio::test]
async fn test_establish_connection_invalid_url() {
    let result = establish_connection("invalid://url").await;
    assert!(result.is_err(), "Should fail with invalid connection URL");
}

#[tokio::test]
async fn test_sqlite_memory_connection_with_migrations() {
    use alle_server::infrastructure::Migrator;
    use sea_orm::Database;
    use sea_orm_migration::MigratorTrait;

    let db = Database::connect("sqlite::memory:")
        .await
        .expect("Failed to connect");

    Migrator::up(&db, None)
        .await
        .expect("Failed to run migrations");

    // Verify migrations ran by checking if tasks table exists
    use alle_server::domains::tasks::Entity as TaskEntity;
    use sea_orm::EntityTrait;

    let result = TaskEntity::find().all(&db).await;
    assert!(result.is_ok(), "Tasks table should exist after migrations");
}
