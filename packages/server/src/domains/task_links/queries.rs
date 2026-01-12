use super::types::TaskLink;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct TaskLinkQuery;

#[Object]
impl TaskLinkQuery {
    /// Get all links for a task (ordered by position)
    async fn task_links(&self, ctx: &Context<'_>, task_id: i32) -> Result<Vec<TaskLink>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let links = app_ctx
            .task_links_repository
            .find_by_task(task_id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(links.into_iter().map(TaskLink::from).collect())
    }
}
