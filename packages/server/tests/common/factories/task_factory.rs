//! Test task factory helpers
//!
//! Note: Not all functions are used in every test file, which is expected for shared test utilities.

#![allow(dead_code)]

use alle_server::AppContext;
use std::sync::Arc;

/// Factory for creating test tasks
pub struct TaskFactory {
    pub ctx: Arc<AppContext>,
}

impl TaskFactory {
    pub fn new(ctx: Arc<AppContext>) -> Self {
        Self { ctx }
    }

    /// Create a task with default values
    pub async fn create(&self, title: &str) -> alle_server::domains::tasks::entity::Model {
        self.ctx
            .task_repository
            .create(title.to_string())
            .await
            .expect("Failed to create test task")
    }

    /// Create a completed task
    pub async fn create_completed(
        &self,
        title: &str,
    ) -> alle_server::domains::tasks::entity::Model {
        let task = self.create(title).await;
        self.ctx
            .task_repository
            .update(task.id, None, Some(true))
            .await
            .expect("Failed to update task to completed")
    }

    /// Create multiple tasks
    pub async fn create_many(
        &self,
        titles: &[&str],
    ) -> Vec<alle_server::domains::tasks::entity::Model> {
        let mut tasks = Vec::new();
        for title in titles {
            tasks.push(self.create(title).await);
        }
        tasks
    }
}

/// Create a test AppContext with in-memory database
pub async fn test_app_context() -> Arc<AppContext> {
    let db = crate::common::db::fresh_in_memory_db().await;
    Arc::new(AppContext::new(db))
}

/// Create task factory with fresh database
pub async fn task_factory() -> TaskFactory {
    let ctx = test_app_context().await;
    TaskFactory::new(ctx)
}
