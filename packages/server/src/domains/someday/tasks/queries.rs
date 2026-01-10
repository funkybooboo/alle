use super::types::SomedayTask;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct SomedayTasksQueries;

#[Object]
impl SomedayTasksQueries {
    /// Get all someday tasks across all lists
    async fn someday_tasks(&self, ctx: &Context<'_>) -> Result<Vec<SomedayTask>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let tasks = app_ctx
            .someday_tasks_repository
            .get_all()
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(tasks.into_iter().map(SomedayTask::from).collect())
    }

    /// Get tasks for a specific list
    async fn someday_tasks_by_list(
        &self,
        ctx: &Context<'_>,
        list_id: i32,
    ) -> Result<Vec<SomedayTask>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let tasks = app_ctx
            .someday_tasks_repository
            .get_by_list(list_id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(tasks.into_iter().map(SomedayTask::from).collect())
    }
}
