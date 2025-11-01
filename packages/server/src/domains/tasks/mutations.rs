use super::types::{CreateTaskInput, Task, UpdateTaskInput};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

/// Task mutations
#[derive(Default)]
pub struct TaskMutations;

#[Object]
impl TaskMutations {
    /// Create a new task
    async fn create_task(&self, ctx: &Context<'_>, input: CreateTaskInput) -> Result<Task> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let date = input
            .date
            .parse::<chrono::DateTime<chrono::Utc>>()
            .map_err(|e| Error::new(format!("Invalid date format: {}", e)))?;
        let task = app_ctx
            .task_repository
            .create(input.title, date)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(Task::from(task))
    }

    /// Update an existing task
    async fn update_task(
        &self,
        ctx: &Context<'_>,
        id: i32,
        input: UpdateTaskInput,
    ) -> Result<Task> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let date = if let Some(date_str) = input.date {
            Some(
                date_str
                    .parse::<chrono::DateTime<chrono::Utc>>()
                    .map_err(|e| Error::new(format!("Invalid date format: {}", e)))?,
            )
        } else {
            None
        };
        let task = app_ctx
            .task_repository
            .update(id, input.title, input.completed, date)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(Task::from(task))
    }

    /// Delete a task
    async fn delete_task(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let rows_affected = app_ctx
            .task_repository
            .delete(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(rows_affected > 0)
    }
}
