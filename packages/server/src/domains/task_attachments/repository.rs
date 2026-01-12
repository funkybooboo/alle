use super::entity;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, Set,
};

pub struct TaskAttachmentRepository {
    db: DatabaseConnection,
}

impl TaskAttachmentRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Create an attachment record
    pub async fn create(
        &self,
        task_id: i32,
        file_name: String,
        file_size: i32,
        mime_type: String,
        storage_path: String,
    ) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();

        let new_attachment = entity::ActiveModel {
            task_id: Set(task_id),
            file_name: Set(file_name),
            file_size: Set(file_size),
            mime_type: Set(mime_type),
            storage_path: Set(storage_path),
            uploaded_at: Set(now),
            ..Default::default()
        };

        new_attachment.insert(&self.db).await
    }

    /// Get all attachments for a task
    pub async fn find_by_task(&self, task_id: i32) -> Result<Vec<entity::Model>, DbErr> {
        entity::Entity::find()
            .filter(entity::Column::TaskId.eq(task_id))
            .all(&self.db)
            .await
    }

    /// Get a specific attachment
    pub async fn find_by_id(&self, id: i32) -> Result<Option<entity::Model>, DbErr> {
        entity::Entity::find_by_id(id).one(&self.db).await
    }

    /// Delete an attachment record
    pub async fn delete(&self, id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(result.rows_affected)
    }

    /// Delete all attachments for a task
    pub async fn delete_by_task(&self, task_id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_many()
            .filter(entity::Column::TaskId.eq(task_id))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }
}
