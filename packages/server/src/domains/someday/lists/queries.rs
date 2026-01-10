use super::types::SomedayList;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct SomedayListsQueries;

#[Object]
impl SomedayListsQueries {
    /// Get all someday lists
    async fn someday_lists(&self, ctx: &Context<'_>) -> Result<Vec<SomedayList>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let lists = app_ctx
            .someday_lists_repository
            .get_all()
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(lists.into_iter().map(SomedayList::from).collect())
    }
}
