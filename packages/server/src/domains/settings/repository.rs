use super::entity;
use sea_orm::{ActiveModelTrait, DatabaseConnection, DbErr, EntityTrait, Set};

pub struct SettingsRepository {
    db: DatabaseConnection,
}

impl SettingsRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Get settings (returns the first and only settings row)
    pub async fn get(&self) -> Result<entity::Model, DbErr> {
        // Settings table should only have one row
        match entity::Entity::find().one(&self.db).await? {
            Some(settings) => Ok(settings),
            None => {
                // If no settings exist, create default settings
                self.create_default().await
            }
        }
    }

    /// Create default settings
    async fn create_default(&self) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();

        let default_breakpoints = r#"{"small":640,"medium":1024,"large":1536,"xlarge":2048}"#;
        let default_counts = r#"{"small":1,"medium":2,"large":3,"xlarge":5,"xxlarge":7}"#;

        let new_settings = entity::ActiveModel {
            column_min_width: Set(300),
            today_shows_previous: Set(false),
            single_arrow_days: Set(1),
            double_arrow_days: Set(7),
            auto_column_breakpoints: Set(default_breakpoints.to_string()),
            auto_column_counts: Set(default_counts.to_string()),
            drawer_height: Set(300),
            drawer_is_open: Set(true),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };

        new_settings.insert(&self.db).await
    }

    /// Update settings
    pub async fn update(
        &self,
        column_min_width: Option<i32>,
        today_shows_previous: Option<bool>,
        single_arrow_days: Option<i32>,
        double_arrow_days: Option<i32>,
        auto_column_breakpoints: Option<String>,
        auto_column_counts: Option<String>,
        drawer_height: Option<i32>,
        drawer_is_open: Option<bool>,
    ) -> Result<entity::Model, DbErr> {
        let current_settings = self.get().await?;
        let mut settings_active: entity::ActiveModel = current_settings.into();

        if let Some(val) = column_min_width {
            settings_active.column_min_width = Set(val);
        }
        if let Some(val) = today_shows_previous {
            settings_active.today_shows_previous = Set(val);
        }
        if let Some(val) = single_arrow_days {
            settings_active.single_arrow_days = Set(val);
        }
        if let Some(val) = double_arrow_days {
            settings_active.double_arrow_days = Set(val);
        }
        if let Some(val) = auto_column_breakpoints {
            settings_active.auto_column_breakpoints = Set(val);
        }
        if let Some(val) = auto_column_counts {
            settings_active.auto_column_counts = Set(val);
        }
        if let Some(val) = drawer_height {
            settings_active.drawer_height = Set(val);
        }
        if let Some(val) = drawer_is_open {
            settings_active.drawer_is_open = Set(val);
        }

        settings_active.updated_at = Set(chrono::Utc::now());

        settings_active.update(&self.db).await
    }
}
