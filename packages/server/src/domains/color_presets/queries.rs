use super::types::ColorPreset;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct ColorPresetQuery;

#[Object]
impl ColorPresetQuery {
    /// Get all color presets (ordered by position)
    async fn color_presets(&self, ctx: &Context<'_>) -> Result<Vec<ColorPreset>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let presets = app_ctx
            .color_presets_repository
            .find_all()
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(presets.into_iter().map(ColorPreset::from).collect())
    }
}
