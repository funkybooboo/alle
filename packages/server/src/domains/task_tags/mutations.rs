use super::types::{AddTaskTagInput, TaskTag};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct TaskTagMutation;

#[Object]
impl TaskTagMutation {
    /// Add a tag to a task
    async fn add_task_tag(&self, ctx: &Context<'_>, input: AddTaskTagInput) -> Result<TaskTag> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let tag = app_ctx
            .task_tags_repository
            .add_tag(input.task_id, input.tag_name)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(TaskTag::from(tag))
    }

    /// Remove a tag from a task
    async fn remove_task_tag(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let rows_affected = app_ctx
            .task_tags_repository
            .delete(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(rows_affected > 0)
    }

    /// Remove all tags from a task
    async fn remove_all_task_tags(&self, ctx: &Context<'_>, task_id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let rows_affected = app_ctx
            .task_tags_repository
            .delete_by_task(task_id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(rows_affected > 0)
    }
}
