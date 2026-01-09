use crate::domains::settings::SettingsRepository;
use crate::domains::tasks::TaskRepository;
use sea_orm::DatabaseConnection;
use std::sync::Arc;

/// Application context holding all dependencies
pub struct AppContext {
    pub task_repository: Arc<TaskRepository>,
    pub settings_repository: Arc<SettingsRepository>,
}

impl AppContext {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            task_repository: Arc::new(TaskRepository::new(db.clone())),
            settings_repository: Arc::new(SettingsRepository::new(db)),
        }
    }
}

impl Clone for AppContext {
    fn clone(&self) -> Self {
        Self {
            task_repository: Arc::clone(&self.task_repository),
            settings_repository: Arc::clone(&self.settings_repository),
        }
    }
}
