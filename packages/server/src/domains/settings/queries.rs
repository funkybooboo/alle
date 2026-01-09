use super::types::Settings;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

/// Settings queries
#[derive(Default)]
pub struct SettingsQueries;

#[Object]
impl SettingsQueries {
    /// Get settings
    async fn settings(&self, ctx: &Context<'_>) -> Result<Settings> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let settings = app_ctx
            .settings_repository
            .get()
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(Settings::from(settings))
    }
}
