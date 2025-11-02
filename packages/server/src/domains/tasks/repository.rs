use super::entity;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, Set,
};

pub struct TaskRepository {
    db: DatabaseConnection,
}

impl TaskRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create(
        &self,
        title: String,
        date: chrono::DateTime<chrono::Utc>,
    ) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();

        let new_task = entity::ActiveModel {
            title: Set(title),
            completed: Set(false),
            date: Set(date),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };

        new_task.insert(&self.db).await
    }

    pub async fn find_all(&self) -> Result<Vec<entity::Model>, DbErr> {
        entity::Entity::find().all(&self.db).await
    }

    pub async fn find_by_id(&self, id: i32) -> Result<Option<entity::Model>, DbErr> {
        entity::Entity::find_by_id(id).one(&self.db).await
    }

    pub async fn update(
        &self,
        id: i32,
        title: Option<String>,
        completed: Option<bool>,
        date: Option<chrono::DateTime<chrono::Utc>>,
    ) -> Result<entity::Model, DbErr> {
        let task_to_update = entity::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(DbErr::RecordNotFound("Task not found".to_string()))?;

        let mut task_active: entity::ActiveModel = task_to_update.into();

        if let Some(new_title) = title {
            task_active.title = Set(new_title);
        }

        if let Some(new_completed) = completed {
            task_active.completed = Set(new_completed);
        }

        if let Some(new_date) = date {
            task_active.date = Set(new_date);
        }

        task_active.updated_at = Set(chrono::Utc::now());

        task_active.update(&self.db).await
    }

    pub async fn delete(&self, id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(result.rows_affected)
    }

    pub async fn find_incomplete(&self) -> Result<Vec<entity::Model>, DbErr> {
        entity::Entity::find()
            .filter(entity::Column::Completed.eq(false))
            .all(&self.db)
            .await
    }
}
