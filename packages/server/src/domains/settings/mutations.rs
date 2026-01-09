use super::types::{Settings, UpdateSettingsInput};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

/// Settings mutations
#[derive(Default)]
pub struct SettingsMutations;

#[Object]
impl SettingsMutations {
    /// Update settings
    async fn update_settings(
        &self,
        ctx: &Context<'_>,
        input: UpdateSettingsInput,
    ) -> Result<Settings> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let settings = app_ctx
            .settings_repository
            .update(
                input.column_min_width,
                input.today_shows_previous,
                input.single_arrow_days,
                input.double_arrow_days,
                input.auto_column_breakpoints,
                input.auto_column_counts,
                input.drawer_height,
                input.drawer_is_open,
            )
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(Settings::from(settings))
    }
}
