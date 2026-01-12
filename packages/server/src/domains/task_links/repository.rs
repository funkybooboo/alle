use super::entity;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter,
    QueryOrder, Set,
};

pub struct TaskLinkRepository {
    db: DatabaseConnection,
}

impl TaskLinkRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Add a link to a task
    pub async fn add_link(
        &self,
        task_id: i32,
        url: String,
        title: Option<String>,
    ) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();

        // Get next position
        let max_position = entity::Entity::find()
            .filter(entity::Column::TaskId.eq(task_id))
            .all(&self.db)
            .await?
            .iter()
            .map(|l| l.position)
            .max()
            .unwrap_or(-1);

        let new_link = entity::ActiveModel {
            task_id: Set(task_id),
            url: Set(url),
            title: Set(title),
            position: Set(max_position + 1),
            created_at: Set(now),
            ..Default::default()
        };

        new_link.insert(&self.db).await
    }

    /// Get all links for a task
    pub async fn find_by_task(&self, task_id: i32) -> Result<Vec<entity::Model>, DbErr> {
        entity::Entity::find()
            .filter(entity::Column::TaskId.eq(task_id))
            .order_by_asc(entity::Column::Position)
            .all(&self.db)
            .await
    }

    /// Update a link
    pub async fn update(
        &self,
        id: i32,
        title: Option<String>,
        url: Option<String>,
    ) -> Result<entity::Model, DbErr> {
        let link = entity::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(DbErr::RecordNotFound("Link not found".to_string()))?;

        let mut link_active: entity::ActiveModel = link.into();

        if let Some(new_title) = title {
            link_active.title = Set(Some(new_title));
        }

        if let Some(new_url) = url {
            link_active.url = Set(new_url);
        }

        link_active.update(&self.db).await
    }

    /// Delete a link
    pub async fn delete(&self, id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(result.rows_affected)
    }

    /// Delete all links for a task
    pub async fn delete_by_task(&self, task_id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_many()
            .filter(entity::Column::TaskId.eq(task_id))
            .exec(&self.db)
            .await?;
        Ok(result.rows_affected)
    }
}
