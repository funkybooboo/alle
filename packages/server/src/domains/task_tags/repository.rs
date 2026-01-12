use super::entity;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, Set,
};

pub struct TaskTagRepository {
    db: DatabaseConnection,
}

impl TaskTagRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Add a tag to a task
    pub async fn add_tag(
        &self,
        task_id: i32,
        tag_name: String,
    ) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();

        let new_tag = entity::ActiveModel {
            task_id: Set(task_id),
            tag_name: Set(tag_name),
            created_at: Set(now),
            ..Default::default()
        };

        new_tag.insert(&self.db).await
    }

    /// Get all tags for a task
    pub async fn find_by_task(&self, task_id: i32) -> Result<Vec<entity::Model>, DbErr> {
        entity::Entity::find()
            .filter(entity::Column::TaskId.eq(task_id))
            .all(&self.db)
            .await
    }

    /// Remove a specific tag
    pub async fn delete(&self, id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(result.rows_affected)
    }

    /// Remove all tags from a task
    pub async fn delete_by_task(&self, task_id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_many()
            .filter(entity::Column::TaskId.eq(task_id))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }

    /// Get all unique tag names
    pub async fn get_all_tag_names(&self) -> Result<Vec<String>, DbErr> {
        let tags = entity::Entity::find().all(&self.db).await?;
        let mut unique_names: Vec<String> = tags
            .into_iter()
            .map(|t| t.tag_name)
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();
        unique_names.sort();
        Ok(unique_names)
    }
}
