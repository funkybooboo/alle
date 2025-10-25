mod common;

use alle_server::graphql::create_schema;
use async_graphql::Request;
use common::task_factory::{test_app_context, TaskFactory};

#[tokio::test]
async fn test_graphql_query_tasks() {
    // Arrange
    let ctx = test_app_context().await;
    let factory = TaskFactory::new(ctx.clone());
    factory.create_many(&["Task 1", "Task 2"]).await;
    let schema = create_schema(ctx);
    let query = r#"
        query {
            tasks {
                id
                title
                completed
            }
        }
    "#;

    // Act
    let response = schema.execute(Request::new(query)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    let tasks = data.get("tasks").unwrap().as_array().unwrap();
    assert_eq!(tasks.len(), 2);
}

#[tokio::test]
async fn test_graphql_query_task_by_id() {
    // Arrange
    let ctx = test_app_context().await;
    let factory = TaskFactory::new(ctx.clone());
    let task = factory.create("Test task").await;
    let schema = create_schema(ctx);
    let query = format!(
        r#"
        query {{
            task(id: {}) {{
                id
                title
                completed
            }}
        }}
        "#,
        task.id
    );

    // Act
    let response = schema.execute(Request::new(&query)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    let returned_task = data.get("task").unwrap();
    assert_eq!(returned_task.get("title").unwrap(), "Test task");
}

#[tokio::test]
async fn test_graphql_query_task_not_found() {
    // Arrange
    let ctx = test_app_context().await;
    let schema = create_schema(ctx);
    let query = r#"
        query {
            task(id: 99999) {
                id
                title
            }
        }
    "#;

    // Act
    let response = schema.execute(Request::new(query)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    assert!(data.get("task").unwrap().is_null());
}

#[tokio::test]
async fn test_graphql_query_incomplete_tasks() {
    // Arrange
    let ctx = test_app_context().await;
    let factory = TaskFactory::new(ctx.clone());
    factory.create("Incomplete").await;
    factory.create_completed("Completed").await;
    let schema = create_schema(ctx);
    let query = r#"
        query {
            incompleteTasks {
                id
                title
                completed
            }
        }
    "#;

    // Act
    let response = schema.execute(Request::new(query)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    let tasks = data.get("incompleteTasks").unwrap().as_array().unwrap();
    assert_eq!(tasks.len(), 1);
    assert_eq!(tasks[0].get("completed").unwrap(), false);
}

#[tokio::test]
async fn test_graphql_mutation_create_task() {
    // Arrange
    let ctx = test_app_context().await;
    let schema = create_schema(ctx.clone());
    let mutation = r#"
        mutation {
            createTask(input: { title: "New task" }) {
                id
                title
                completed
            }
        }
    "#;

    // Act
    let response = schema.execute(Request::new(mutation)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    let task = data.get("createTask").unwrap();
    assert_eq!(task.get("title").unwrap(), "New task");
    assert_eq!(task.get("completed").unwrap(), false);
    let all_tasks = ctx.task_repository.find_all().await.unwrap();
    assert_eq!(all_tasks.len(), 1);
}

#[tokio::test]
async fn test_graphql_mutation_update_task() {
    // Arrange
    let ctx = test_app_context().await;
    let factory = TaskFactory::new(ctx.clone());
    let task = factory.create("Original").await;
    let schema = create_schema(ctx);
    let mutation = format!(
        r#"
        mutation {{
            updateTask(id: {}, input: {{ title: "Updated", completed: true }}) {{
                id
                title
                completed
            }}
        }}
        "#,
        task.id
    );

    // Act
    let response = schema.execute(Request::new(&mutation)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    let updated_task = data.get("updateTask").unwrap();
    assert_eq!(updated_task.get("title").unwrap(), "Updated");
    assert_eq!(updated_task.get("completed").unwrap(), true);
}

#[tokio::test]
async fn test_graphql_mutation_update_partial() {
    // Arrange
    let ctx = test_app_context().await;
    let factory = TaskFactory::new(ctx.clone());
    let task = factory.create("Original").await;
    let schema = create_schema(ctx);
    let mutation = format!(
        r#"
        mutation {{
            updateTask(id: {}, input: {{ completed: true }}) {{
                id
                title
                completed
            }}
        }}
        "#,
        task.id
    );

    // Act
    let response = schema.execute(Request::new(&mutation)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    let updated_task = data.get("updateTask").unwrap();
    assert_eq!(updated_task.get("title").unwrap(), "Original");
    assert_eq!(updated_task.get("completed").unwrap(), true);
}

#[tokio::test]
async fn test_graphql_mutation_delete_task() {
    // Arrange
    let ctx = test_app_context().await;
    let factory = TaskFactory::new(ctx.clone());
    let task = factory.create("To delete").await;
    let schema = create_schema(ctx.clone());
    let mutation = format!(
        r#"
        mutation {{
            deleteTask(id: {})
        }}
        "#,
        task.id
    );

    // Act
    let response = schema.execute(Request::new(&mutation)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    assert_eq!(data.get("deleteTask").unwrap(), true);
    let found = ctx.task_repository.find_by_id(task.id).await.unwrap();
    assert!(found.is_none());
}

#[tokio::test]
async fn test_graphql_mutation_delete_nonexistent() {
    // Arrange
    let ctx = test_app_context().await;
    let schema = create_schema(ctx);
    let mutation = r#"
        mutation {
            deleteTask(id: 99999)
        }
    "#;

    // Act
    let response = schema.execute(Request::new(mutation)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    assert_eq!(data.get("deleteTask").unwrap(), false);
}

#[tokio::test]
async fn test_graphql_complex_query() {
    // Arrange
    let ctx = test_app_context().await;
    let factory = TaskFactory::new(ctx.clone());
    factory.create("Task 1").await;
    factory.create_completed("Task 2").await;
    let schema = create_schema(ctx);
    let query = r#"
        query {
            all: tasks {
                id
                title
            }
            incomplete: incompleteTasks {
                id
                title
            }
        }
    "#;

    // Act
    let response = schema.execute(Request::new(query)).await;

    // Assert
    assert!(response.errors.is_empty());
    let data = response.data.into_json().unwrap();
    assert_eq!(data.get("all").unwrap().as_array().unwrap().len(), 2);
    assert_eq!(data.get("incomplete").unwrap().as_array().unwrap().len(), 1);
}
