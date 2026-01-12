use super::types::{CreateTagPresetInput, TagPreset};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct TagPresetMutation;

#[Object]
impl TagPresetMutation {
    /// Create a new tag preset
    async fn create_tag_preset(
        &self,
        ctx: &Context<'_>,
        input: CreateTagPresetInput,
    ) -> Result<TagPreset> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let preset = app_ctx
            .tag_presets_repository
            .create(input.name)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(TagPreset::from(preset))
    }

    /// Rename a tag preset (affects all tasks using this tag)
    async fn rename_tag_preset(&self, ctx: &Context<'_>, id: i32, new_name: String) -> Result<TagPreset> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let preset = app_ctx
            .tag_presets_repository
            .update_name(id, new_name)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(TagPreset::from(preset))
    }

    /// Delete a tag preset
    async fn delete_tag_preset(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let rows_affected = app_ctx
            .tag_presets_repository
            .delete(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(rows_affected > 0)
    }
}
