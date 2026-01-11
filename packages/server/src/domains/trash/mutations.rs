use async_graphql::*;
use chrono::DateTime;
use std::sync::Arc;

use super::types::{CreateTrashInput, TrashItem};
use crate::infrastructure::context::AppContext;

#[derive(Default)]
pub struct TrashMutations;

#[Object]
impl TrashMutations {
    async fn create_trash_item(
        &self,
        ctx: &Context<'_>,
        input: CreateTrashInput,
    ) -> Result<TrashItem> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let task_date = DateTime::parse_from_rfc3339(&input.task_date)?.with_timezone(&chrono::Utc);

        let trash_item = app_ctx
            .trash_repository
            .create(
                input.task_id,
                input.task_text,
                task_date,
                input.task_completed,
                input.task_type,
                input.someday_list_id,
            )
            .await?;

        Ok(trash_item.into())
    }

    async fn delete_trash_item(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        app_ctx.trash_repository.delete(id).await?;
        Ok(true)
    }

    async fn clean_old_trash(&self, ctx: &Context<'_>) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        app_ctx.trash_repository.clean_old().await?;
        Ok(true)
    }
}
