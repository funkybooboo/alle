use super::types::Task;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
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
