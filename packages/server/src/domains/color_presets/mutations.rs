use super::types::{ColorPreset, CreateColorPresetInput, UpdateColorPresetInput};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct ColorPresetMutation;

#[Object]
impl ColorPresetMutation {
    /// Create a new color preset
    async fn create_color_preset(
        &self,
        ctx: &Context<'_>,
        input: CreateColorPresetInput,
    ) -> Result<ColorPreset> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let preset = app_ctx
            .color_presets_repository
            .create(input.name, input.hex_value)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(ColorPreset::from(preset))
    }

    /// Update a color preset
    async fn update_color_preset(
        &self,
        ctx: &Context<'_>,
        id: i32,
        input: UpdateColorPresetInput,
    ) -> Result<ColorPreset> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let preset = app_ctx
            .color_presets_repository
            .update(id, input.name, input.hex_value)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(ColorPreset::from(preset))
    }

    /// Reorder color presets
    async fn reorder_color_presets(
        &self,
        ctx: &Context<'_>,
        ids: Vec<i32>,
    ) -> Result<Vec<ColorPreset>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let presets = app_ctx
            .color_presets_repository
            .reorder(ids)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(presets.into_iter().map(ColorPreset::from).collect())
    }

    /// Delete a color preset
    async fn delete_color_preset(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let rows_affected = app_ctx
            .color_presets_repository
            .delete(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(rows_affected > 0)
    }
}
