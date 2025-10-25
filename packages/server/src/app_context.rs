use crate::repositories::TaskRepository;
use sea_orm::DatabaseConnection;
use std::sync::Arc;

/// Application context holding all dependencies
pub struct AppContext {
    pub task_repository: Arc<TaskRepository>,
}

impl AppContext {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            task_repository: Arc::new(TaskRepository::new(db)),
        }
    }
}

impl Clone for AppContext {
    fn clone(&self) -> Self {
        Self {
            task_repository: Arc::clone(&self.task_repository),
        }
    }
}
