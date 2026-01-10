use super::types::{CreateSomedayListInput, SomedayList, UpdateSomedayListInput};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct SomedayListsMutations;

#[Object]
impl SomedayListsMutations {
    /// Create a new someday list
    async fn create_someday_list(
        &self,
        ctx: &Context<'_>,
        input: CreateSomedayListInput,
    ) -> Result<SomedayList> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let list = app_ctx
            .someday_lists_repository
            .create(input.name, input.position)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(SomedayList::from(list))
    }

    /// Update a someday list
    async fn update_someday_list(
        &self,
        ctx: &Context<'_>,
        input: UpdateSomedayListInput,
    ) -> Result<SomedayList> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let list = app_ctx
            .someday_lists_repository
            .update(input.id, input.name, input.position)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(SomedayList::from(list))
    }

    /// Delete a someday list
    async fn delete_someday_list(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        app_ctx
            .someday_lists_repository
            .delete(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(true)
    }
}
