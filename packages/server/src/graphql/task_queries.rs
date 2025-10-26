use super::types::{CreateTaskInput, Task, UpdateTaskInput};
use crate::AppContext;
use async_graphql::*;
use std::sync::Arc;

/// Task queries
#[derive(Default)]
pub struct TaskQueries;

#[Object]
impl TaskQueries {
    /// Get all tasks
    async fn tasks(&self, ctx: &Context<'_>) -> Result<Vec<Task>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let tasks = app_ctx
            .task_repository
            .find_all()
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(tasks.into_iter().map(Task::from).collect())
    }

    /// Get task by ID
    async fn task(&self, ctx: &Context<'_>, id: i32) -> Result<Option<Task>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let task = app_ctx
            .task_repository
            .find_by_id(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(task.map(Task::from))
    }

    /// Get incomplete tasks
    async fn incomplete_tasks(&self, ctx: &Context<'_>) -> Result<Vec<Task>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let tasks = app_ctx
            .task_repository
            .find_incomplete()
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(tasks.into_iter().map(Task::from).collect())
    }
}

/// Task mutations
#[derive(Default)]
pub struct TaskMutations;

#[Object]
impl TaskMutations {
    /// Create a new task
    async fn create_task(&self, ctx: &Context<'_>, input: CreateTaskInput) -> Result<Task> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let task = app_ctx
            .task_repository
            .create(input.title)
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
        let task = app_ctx
            .task_repository
            .update(id, input.title, input.completed)
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
