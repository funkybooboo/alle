use async_graphql::*;
use std::sync::Arc;

use super::types::TrashItem;
use crate::infrastructure::context::AppContext;

#[derive(Default)]
pub struct TrashQueries;

#[Object]
impl TrashQueries {
    async fn trash(&self, ctx: &Context<'_>) -> Result<Vec<TrashItem>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let trash_items = app_ctx.trash_repository.get_all().await?;
        Ok(trash_items.into_iter().map(Into::into).collect())
    }
}
