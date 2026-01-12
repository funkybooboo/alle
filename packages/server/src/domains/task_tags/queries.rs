use super::types::TaskTag;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct TaskTagQuery;

#[Object]
impl TaskTagQuery {
    /// Get all tags for a task
    async fn task_tags(&self, ctx: &Context<'_>, task_id: i32) -> Result<Vec<TaskTag>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let tags = app_ctx
            .task_tags_repository
            .find_by_task(task_id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(tags.into_iter().map(TaskTag::from).collect())
    }

    /// Get all unique tag names across all tasks
    async fn all_tag_names(&self, ctx: &Context<'_>) -> Result<Vec<String>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let tag_names = app_ctx
            .task_tags_repository
            .get_all_tag_names()
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(tag_names)
    }
}
