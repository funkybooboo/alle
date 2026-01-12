use super::types::{AddTaskLinkInput, TaskLink, UpdateTaskLinkInput};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct TaskLinkMutation;

#[Object]
impl TaskLinkMutation {
    /// Add a link to a task
    async fn add_task_link(&self, ctx: &Context<'_>, input: AddTaskLinkInput) -> Result<TaskLink> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let link = app_ctx
            .task_links_repository
            .add_link(input.task_id, input.url, input.title)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(TaskLink::from(link))
    }

    /// Update a link
    async fn update_task_link(
        &self,
        ctx: &Context<'_>,
        id: i32,
        input: UpdateTaskLinkInput,
    ) -> Result<TaskLink> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let link = app_ctx
            .task_links_repository
            .update(id, input.title, input.url)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(TaskLink::from(link))
    }

    /// Delete a link
    async fn delete_task_link(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let rows_affected = app_ctx
            .task_links_repository
            .delete(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(rows_affected > 0)
    }

    /// Delete all links from a task
    async fn delete_all_task_links(&self, ctx: &Context<'_>, task_id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let rows_affected = app_ctx
            .task_links_repository
            .delete_by_task(task_id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(rows_affected > 0)
    }
}
