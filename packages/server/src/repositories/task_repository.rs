use crate::entities::task;
use sea_orm::*;

pub struct TaskRepository {
    db: DatabaseConnection,
}

impl TaskRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    fn db(&self) -> &DatabaseConnection {
        &self.db
    }

    pub async fn create(&self, title: String) -> Result<task::Model, DbErr> {
        let now = chrono::Utc::now();

        let new_task = task::ActiveModel {
            title: Set(title),
            completed: Set(false),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };

        new_task.insert(self.db()).await
    }

    pub async fn find_all(&self) -> Result<Vec<task::Model>, DbErr> {
        task::Entity::find().all(self.db()).await
    }

    pub async fn find_by_id(&self, id: i32) -> Result<Option<task::Model>, DbErr> {
        task::Entity::find_by_id(id).one(self.db()).await
    }

    pub async fn update(
        &self,
        id: i32,
        title: Option<String>,
        completed: Option<bool>,
    ) -> Result<task::Model, DbErr> {
        let task_to_update = task::Entity::find_by_id(id)
            .one(self.db())
            .await?
            .ok_or(DbErr::RecordNotFound("Task not found".to_string()))?;

        let mut task_active: task::ActiveModel = task_to_update.into();

        if let Some(new_title) = title {
            task_active.title = Set(new_title);
        }

        if let Some(new_completed) = completed {
            task_active.completed = Set(new_completed);
        }

        task_active.updated_at = Set(chrono::Utc::now());

        task_active.update(self.db()).await
    }

    pub async fn delete(&self, id: i32) -> Result<u64, DbErr> {
        let result = task::Entity::delete_by_id(id).exec(self.db()).await?;
        Ok(result.rows_affected)
    }

    pub async fn find_incomplete(&self) -> Result<Vec<task::Model>, DbErr> {
        task::Entity::find()
            .filter(task::Column::Completed.eq(false))
            .all(self.db())
            .await
    }
}
