use super::types::{CreateSomedayTaskInput, SomedayTask, UpdateSomedayTaskInput};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct SomedayTasksMutations;

#[Object]
impl SomedayTasksMutations {
    /// Create a new someday task
    async fn create_someday_task(
        &self,
        ctx: &Context<'_>,
        input: CreateSomedayTaskInput,
    ) -> Result<SomedayTask> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let task = app_ctx
            .someday_tasks_repository
            .create(input.list_id, input.title, input.description, input.position)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(SomedayTask::from(task))
    }

    /// Update a someday task
    async fn update_someday_task(
        &self,
        ctx: &Context<'_>,
        input: UpdateSomedayTaskInput,
    ) -> Result<SomedayTask> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let task = app_ctx
            .someday_tasks_repository
            .update(
                input.id,
                input.title,
                input.description.map(Some),
                input.completed,
                input.position,
                input.list_id,
            )
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(SomedayTask::from(task))
    }

    /// Toggle task completion status
    async fn toggle_someday_task(&self, ctx: &Context<'_>, id: i32) -> Result<SomedayTask> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let task = app_ctx
            .someday_tasks_repository
            .toggle_completed(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(SomedayTask::from(task))
    }

    /// Delete a someday task
    async fn delete_someday_task(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        app_ctx
            .someday_tasks_repository
            .delete(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(true)
    }
}
