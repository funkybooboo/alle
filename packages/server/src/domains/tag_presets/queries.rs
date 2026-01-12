use super::types::TagPreset;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct TagPresetQuery;

#[Object]
impl TagPresetQuery {
    /// Get all tag presets
    async fn tag_presets(&self, ctx: &Context<'_>) -> Result<Vec<TagPreset>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let presets = app_ctx
            .tag_presets_repository
            .find_all()
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(presets.into_iter().map(TagPreset::from).collect())
    }
}
