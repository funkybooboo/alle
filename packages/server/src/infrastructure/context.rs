use crate::domains::settings::SettingsRepository;
use crate::domains::someday::{SomedayListsRepository, SomedayTasksRepository};
use crate::domains::tasks::TaskRepository;
use crate::domains::trash::TrashRepository;
use sea_orm::DatabaseConnection;
use std::sync::Arc;

/// Application context holding all dependencies
pub struct AppContext {
    pub task_repository: Arc<TaskRepository>,
    pub settings_repository: Arc<SettingsRepository>,
    pub someday_lists_repository: Arc<SomedayListsRepository>,
    pub someday_tasks_repository: Arc<SomedayTasksRepository>,
    pub trash_repository: Arc<TrashRepository>,
}

impl AppContext {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            task_repository: Arc::new(TaskRepository::new(db.clone())),
            settings_repository: Arc::new(SettingsRepository::new(db.clone())),
            someday_lists_repository: Arc::new(SomedayListsRepository::new(db.clone())),
            someday_tasks_repository: Arc::new(SomedayTasksRepository::new(db.clone())),
            trash_repository: Arc::new(TrashRepository::new(db)),
        }
    }
}

impl Clone for AppContext {
    fn clone(&self) -> Self {
        Self {
            task_repository: Arc::clone(&self.task_repository),
            settings_repository: Arc::clone(&self.settings_repository),
            someday_lists_repository: Arc::clone(&self.someday_lists_repository),
            someday_tasks_repository: Arc::clone(&self.someday_tasks_repository),
            trash_repository: Arc::clone(&self.trash_repository),
        }
    }
}
