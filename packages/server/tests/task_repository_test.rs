mod common;

use common::assertions::{assert_count, assert_task_eq, assert_task_exists, assert_task_not_found};
use common::task_factory::{task_factory, test_app_context};

#[tokio::test]
async fn test_create_task() {
    // Arrange
    let ctx = test_app_context().await;

    // Act
    let task = ctx
        .task_repository
        .create("New task".to_string())
        .await
        .unwrap();

    // Assert
    assert_task_eq(&task, "New task", false);
    assert!(task.id > 0);
}

#[tokio::test]
async fn test_find_all_tasks() {
    // Arrange
    let factory = task_factory().await;
    factory.create_many(&["Task 1", "Task 2", "Task 3"]).await;

    // Act
    let all_tasks = factory.ctx.task_repository.find_all().await.unwrap();

    // Assert
    assert_count(&all_tasks, 3);
}

#[tokio::test]
async fn test_find_by_id_found() {
    // Arrange
    let factory = task_factory().await;
    let task = factory.create("Test task").await;

    // Act
    let found = factory
        .ctx
        .task_repository
        .find_by_id(task.id)
        .await
        .unwrap();

    // Assert
    assert_task_exists(found, "Test task");
}

#[tokio::test]
async fn test_find_by_id_not_found() {
    // Arrange
    let ctx = test_app_context().await;

    // Act
    let found = ctx.task_repository.find_by_id(99999).await.unwrap();

    // Assert
    assert_task_not_found(found);
}

#[tokio::test]
async fn test_update_title_only() {
    // Arrange
    let factory = task_factory().await;
    let task = factory.create("Original").await;

    // Act
    let updated = factory
        .ctx
        .task_repository
        .update(task.id, Some("Updated".to_string()), None)
        .await
        .unwrap();

    // Assert
    assert_task_eq(&updated, "Updated", false);
}

#[tokio::test]
async fn test_update_completed_only() {
    // Arrange
    let factory = task_factory().await;
    let task = factory.create("Test task").await;

    // Act
    let updated = factory
        .ctx
        .task_repository
        .update(task.id, None, Some(true))
        .await
        .unwrap();

    // Assert
    assert_task_eq(&updated, "Test task", true);
}

#[tokio::test]
async fn test_update_both_fields() {
    // Arrange
    let factory = task_factory().await;
    let task = factory.create("Original").await;

    // Act
    let updated = factory
        .ctx
        .task_repository
        .update(task.id, Some("Updated".to_string()), Some(true))
        .await
        .unwrap();

    // Assert
    assert_task_eq(&updated, "Updated", true);
}

#[tokio::test]
async fn test_update_nonexistent_task() {
    // Arrange
    let ctx = test_app_context().await;

    // Act
    let result = ctx
        .task_repository
        .update(99999, Some("Updated".to_string()), None)
        .await;

    // Assert
    assert!(result.is_err());
}

#[tokio::test]
async fn test_delete_task() {
    // Arrange
    let factory = task_factory().await;
    let task = factory.create("To delete").await;

    // Act
    let rows = factory.ctx.task_repository.delete(task.id).await.unwrap();

    // Assert
    assert_eq!(rows, 1);
    let found = factory
        .ctx
        .task_repository
        .find_by_id(task.id)
        .await
        .unwrap();
    assert_task_not_found(found);
}

#[tokio::test]
async fn test_delete_nonexistent_task() {
    // Arrange
    let ctx = test_app_context().await;

    // Act
    let rows = ctx.task_repository.delete(99999).await.unwrap();

    // Assert
    assert_eq!(rows, 0);
}

#[tokio::test]
async fn test_find_incomplete_empty() {
    // Arrange
    let ctx = test_app_context().await;

    // Act
    let incomplete = ctx.task_repository.find_incomplete().await.unwrap();

    // Assert
    assert_count(&incomplete, 0);
}

#[tokio::test]
async fn test_find_incomplete_only_incomplete() {
    // Arrange
    let factory = task_factory().await;
    factory.create_many(&["Task 1", "Task 2", "Task 3"]).await;

    // Act
    let incomplete = factory.ctx.task_repository.find_incomplete().await.unwrap();

    // Assert
    assert_count(&incomplete, 3);
}

#[tokio::test]
async fn test_find_incomplete_mixed() {
    // Arrange
    let factory = task_factory().await;
    factory.create("Incomplete 1").await;
    factory.create_completed("Completed").await;
    factory.create("Incomplete 2").await;

    // Act
    let incomplete = factory.ctx.task_repository.find_incomplete().await.unwrap();

    // Assert
    assert_count(&incomplete, 2);
}

#[tokio::test]
async fn test_find_incomplete_only_completed() {
    // Arrange
    let factory = task_factory().await;
    factory.create_completed("Task 1").await;
    factory.create_completed("Task 2").await;

    // Act
    let incomplete = factory.ctx.task_repository.find_incomplete().await.unwrap();

    // Assert
    assert_count(&incomplete, 0);
}

#[tokio::test]
async fn test_task_timestamps() {
    // Arrange
    let ctx = test_app_context().await;

    // Act
    let task = ctx
        .task_repository
        .create("Test".to_string())
        .await
        .unwrap();

    // Assert
    assert!(!task.created_at.to_string().is_empty());
    assert!(!task.updated_at.to_string().is_empty());
    assert_eq!(task.created_at, task.updated_at);
}

#[tokio::test]
async fn test_update_changes_updated_at() {
    // Arrange
    let factory = task_factory().await;
    let task = factory.create("Test").await;
    let original_updated_at = task.updated_at;
    tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;

    // Act
    let updated = factory
        .ctx
        .task_repository
        .update(task.id, Some("Updated".to_string()), None)
        .await
        .unwrap();

    // Assert
    assert!(updated.updated_at > original_updated_at);
}
