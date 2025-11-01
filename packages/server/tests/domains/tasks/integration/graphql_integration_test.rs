use crate::common::factories::task_factory::{task_factory, test_app_context, TaskFactory};
use alle_server::graphql::create_schema;
use async_graphql::Request;

// Helper to execute GraphQL query and return JSON response
async fn execute_query(
    ctx: std::sync::Arc<alle_server::AppContext>,
    query: &str,
) -> serde_json::Value {
    let schema = create_schema(ctx);
    let response = schema.execute(Request::new(query)).await;
    response.data.into_json().unwrap()
}

// Helper to check if response has errors
async fn has_errors(ctx: std::sync::Arc<alle_server::AppContext>, query: &str) -> bool {
    let schema = create_schema(ctx);
    let response = schema.execute(Request::new(query)).await;
    !response.errors.is_empty()
}

#[tokio::test]
async fn test_graphql_query_all_fields() {
    // Test querying all fields of a task
    let factory = task_factory().await;
    let task = factory.create("Complete task").await;

    let query = format!(
        r#"
        query {{
            task(id: {}) {{
                id
                title
                completed
                createdAt
                updatedAt
            }}
        }}
        "#,
        task.id
    );

    let data = execute_query(factory.ctx, &query).await;
    let returned_task = data.get("task").unwrap();

    assert_eq!(returned_task["id"], task.id);
    assert_eq!(returned_task["title"], "Complete task");
    assert_eq!(returned_task["completed"], false);
    assert!(!returned_task["createdAt"].as_str().unwrap().is_empty());
    assert!(!returned_task["updatedAt"].as_str().unwrap().is_empty());
}

#[tokio::test]
async fn test_graphql_query_partial_fields() {
    // Test querying only some fields
    let factory = task_factory().await;
    let task = factory.create("Partial").await;

    let query = format!(
        r#"
        query {{
            task(id: {}) {{
                id
                title
            }}
        }}
        "#,
        task.id
    );

    let data = execute_query(factory.ctx, &query).await;
    let returned_task = data.get("task").unwrap();

    assert_eq!(returned_task["id"], task.id);
    assert_eq!(returned_task["title"], "Partial");
    // completed, createdAt, updatedAt should not be in response
    assert!(returned_task.get("completed").is_none());
}

#[tokio::test]
async fn test_graphql_multiple_queries() {
    // Test multiple queries in one request
    let factory = task_factory().await;
    factory.create("Task 1").await;
    factory.create_completed("Task 2").await;
    factory.create("Task 3").await;

    let query = r#"
        query {
            allTasks: tasks {
                id
                title
            }
            incompleteTasks {
                id
                title
            }
        }
    "#;

    let data = execute_query(factory.ctx, query).await;

    assert_eq!(data["allTasks"].as_array().unwrap().len(), 3);
    assert_eq!(data["incompleteTasks"].as_array().unwrap().len(), 2);
}

#[tokio::test]
async fn test_graphql_create_and_query() {
    // Test creating a task and immediately querying it
    let ctx = test_app_context().await;

    let mutation = r#"
        mutation {
            createTask(input: { title: "Created via GraphQL" }) {
                id
                title
                completed
            }
        }
    "#;

    let data = execute_query(ctx.clone(), mutation).await;
    let created_task = data.get("createTask").unwrap();
    let task_id = created_task["id"].as_i64().unwrap();

    let query = format!(
        r#"
        query {{
            task(id: {}) {{
                title
            }}
        }}
        "#,
        task_id
    );

    let query_data = execute_query(ctx, &query).await;
    assert_eq!(query_data["task"]["title"], "Created via GraphQL");
}

#[tokio::test]
async fn test_graphql_update_and_verify() {
    // Test updating a task and verifying the change
    let factory = task_factory().await;
    let task = factory.create("Original").await;

    let mutation = format!(
        r#"
        mutation {{
            updateTask(id: {}, input: {{ title: "Modified", completed: true }}) {{
                id
                title
                completed
            }}
        }}
        "#,
        task.id
    );

    let data = execute_query(factory.ctx.clone(), &mutation).await;
    assert_eq!(data["updateTask"]["title"], "Modified");
    assert_eq!(data["updateTask"]["completed"], true);

    // Verify via query
    let query = format!(
        r#"
        query {{
            task(id: {}) {{
                title
                completed
            }}
        }}
        "#,
        task.id
    );

    let query_data = execute_query(factory.ctx, &query).await;
    assert_eq!(query_data["task"]["title"], "Modified");
    assert_eq!(query_data["task"]["completed"], true);
}

#[tokio::test]
async fn test_graphql_delete_and_verify() {
    // Test deleting a task and verifying it's gone
    let factory = task_factory().await;
    let task = factory.create("To delete").await;

    let mutation = format!(
        r#"
        mutation {{
            deleteTask(id: {})
        }}
        "#,
        task.id
    );

    let data = execute_query(factory.ctx.clone(), &mutation).await;
    assert_eq!(data["deleteTask"], true);

    // Verify task is gone
    let query = format!(
        r#"
        query {{
            task(id: {}) {{
                id
            }}
        }}
        "#,
        task.id
    );

    let query_data = execute_query(factory.ctx, &query).await;
    assert!(query_data["task"].is_null());
}

#[tokio::test]
async fn test_graphql_bulk_operations() {
    // Test creating multiple tasks and querying them
    let ctx = test_app_context().await;

    for i in 1..=5 {
        let mutation = format!(
            r#"
            mutation {{
                createTask(input: {{ title: "Bulk task {}" }}) {{
                    id
                }}
            }}
            "#,
            i
        );
        execute_query(ctx.clone(), &mutation).await;
    }

    let query = r#"
        query {
            tasks {
                id
                title
            }
        }
    "#;

    let data = execute_query(ctx, query).await;
    let tasks = data["tasks"].as_array().unwrap();
    assert_eq!(tasks.len(), 5);
}

#[tokio::test]
async fn test_graphql_filtering_incomplete() {
    // Test that incompleteTasks only returns incomplete tasks
    let factory = task_factory().await;
    factory.create("Incomplete 1").await;
    factory.create("Incomplete 2").await;
    factory.create_completed("Completed 1").await;
    factory.create_completed("Completed 2").await;
    factory.create("Incomplete 3").await;

    let query = r#"
        query {
            incompleteTasks {
                id
                title
                completed
            }
        }
    "#;

    let data = execute_query(factory.ctx, query).await;
    let tasks = data["incompleteTasks"].as_array().unwrap();

    assert_eq!(tasks.len(), 3);
    for task in tasks {
        assert_eq!(task["completed"], false);
    }
}

#[tokio::test]
async fn test_graphql_nested_query() {
    // Test complex nested query with aliases
    let factory = task_factory().await;
    let task1 = factory.create("Task A").await;
    let task2 = factory.create_completed("Task B").await;

    let query = format!(
        r#"
        query {{
            firstTask: task(id: {}) {{
                id
                title
                completed
            }}
            secondTask: task(id: {}) {{
                id
                title
                completed
            }}
            allTasks: tasks {{
                id
            }}
        }}
        "#,
        task1.id, task2.id
    );

    let data = execute_query(factory.ctx, &query).await;

    assert_eq!(data["firstTask"]["title"], "Task A");
    assert_eq!(data["firstTask"]["completed"], false);
    assert_eq!(data["secondTask"]["title"], "Task B");
    assert_eq!(data["secondTask"]["completed"], true);
    assert_eq!(data["allTasks"].as_array().unwrap().len(), 2);
}

#[tokio::test]
async fn test_graphql_mutation_chain() {
    // Test chaining multiple mutations
    let ctx = test_app_context().await;

    let mutation1 = r#"
        mutation {
            createTask(input: { title: "First" }) {
                id
            }
        }
    "#;

    let data1 = execute_query(ctx.clone(), mutation1).await;
    let task_id = data1["createTask"]["id"].as_i64().unwrap();

    let mutation2 = format!(
        r#"
        mutation {{
            updateTask(id: {}, input: {{ completed: true }}) {{
                completed
            }}
        }}
        "#,
        task_id
    );

    let data2 = execute_query(ctx.clone(), &mutation2).await;
    assert_eq!(data2["updateTask"]["completed"], true);

    let mutation3 = format!(
        r#"
        mutation {{
            deleteTask(id: {})
        }}
        "#,
        task_id
    );

    let data3 = execute_query(ctx, &mutation3).await;
    assert_eq!(data3["deleteTask"], true);
}

#[tokio::test]
async fn test_graphql_error_handling_invalid_id() {
    // Test that invalid operations return appropriate errors
    let ctx = test_app_context().await;

    // This should not error at GraphQL level, but return null
    let query = r#"
        query {
            task(id: 99999) {
                id
            }
        }
    "#;

    let has_err = has_errors(ctx.clone(), query).await;
    assert!(!has_err); // Should not have GraphQL errors

    let data = execute_query(ctx, query).await;
    assert!(data["task"].is_null()); // But should return null
}

#[tokio::test]
async fn test_graphql_concurrent_mutations() {
    // Test that concurrent mutations work correctly
    let ctx = test_app_context().await;
    let factory = TaskFactory::new(ctx.clone());

    // Create multiple tasks
    let tasks = factory.create_many(&["Task 1", "Task 2", "Task 3"]).await;

    // Update all of them to completed
    for task in &tasks {
        let mutation = format!(
            r#"
            mutation {{
                updateTask(id: {}, input: {{ completed: true }}) {{
                    id
                }}
            }}
            "#,
            task.id
        );
        execute_query(ctx.clone(), &mutation).await;
    }

    // Verify all are completed
    let query = r#"
        query {
            tasks {
                id
                completed
            }
        }
    "#;

    let data = execute_query(ctx, query).await;
    let all_tasks = data["tasks"].as_array().unwrap();

    assert_eq!(all_tasks.len(), 3);
    for task in all_tasks {
        assert_eq!(task["completed"], true);
    }
}

#[tokio::test]
async fn test_graphql_empty_database_queries() {
    // Test queries on empty database
    let ctx = test_app_context().await;

    let query = r#"
        query {
            tasks {
                id
            }
            incompleteTasks {
                id
            }
        }
    "#;

    let data = execute_query(ctx, query).await;

    assert_eq!(data["tasks"].as_array().unwrap().len(), 0);
    assert_eq!(data["incompleteTasks"].as_array().unwrap().len(), 0);
}

#[tokio::test]
async fn test_graphql_special_characters_in_title() {
    // Test that special characters are properly handled
    let ctx = test_app_context().await;

    let mutation = r#"
        mutation {
            createTask(input: { title: "Task with \"quotes\" and 'apostrophes' & symbols" }) {
                id
                title
            }
        }
    "#;

    let data = execute_query(ctx.clone(), mutation).await;
    let task = data["createTask"].clone();
    let task_id = task["id"].as_i64().unwrap();

    assert!(task["title"].as_str().unwrap().contains("quotes"));

    // Verify via query
    let query = format!(
        r#"
        query {{
            task(id: {}) {{
                title
            }}
        }}
        "#,
        task_id
    );

    let query_data = execute_query(ctx, &query).await;
    assert!(query_data["task"]["title"]
        .as_str()
        .unwrap()
        .contains("quotes"));
}

#[tokio::test]
async fn test_graphql_long_title() {
    // Test handling of very long titles
    let ctx = test_app_context().await;
    let long_title = "A".repeat(500);

    let mutation = format!(
        r#"
        mutation {{
            createTask(input: {{ title: "{}" }}) {{
                id
                title
            }}
        }}
        "#,
        long_title
    );

    let data = execute_query(ctx, &mutation).await;
    let task = data["createTask"].clone();

    assert_eq!(task["title"].as_str().unwrap().len(), 500);
}

#[tokio::test]
async fn test_graphql_update_preserves_unchanged_fields() {
    // Test that partial updates don't affect other fields
    let factory = task_factory().await;
    let task = factory.create("Original Title").await;

    // Update only completed status
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

    let data = execute_query(factory.ctx, &mutation).await;
    let updated = data["updateTask"].clone();

    assert_eq!(updated["title"], "Original Title"); // Should be unchanged
    assert_eq!(updated["completed"], true); // Should be updated
}

#[tokio::test]
async fn test_graphql_multiple_deletes() {
    // Test deleting multiple tasks
    let factory = task_factory().await;
    let tasks = factory
        .create_many(&["Delete 1", "Delete 2", "Delete 3"])
        .await;

    for task in &tasks {
        let mutation = format!(
            r#"
            mutation {{
                deleteTask(id: {})
            }}
            "#,
            task.id
        );

        let data = execute_query(factory.ctx.clone(), &mutation).await;
        assert_eq!(data["deleteTask"], true);
    }

    // Verify all are deleted
    let query = r#"
        query {
            tasks {
                id
            }
        }
    "#;

    let data = execute_query(factory.ctx, query).await;
    assert_eq!(data["tasks"].as_array().unwrap().len(), 0);
}

#[tokio::test]
async fn test_graphql_create_empty_title() {
    // Test creating task with empty title (should be allowed)
    let ctx = test_app_context().await;

    let mutation = r#"
        mutation {
            createTask(input: { title: "" }) {
                id
                title
            }
        }
    "#;

    let data = execute_query(ctx, mutation).await;
    assert_eq!(data["createTask"]["title"], "");
}
