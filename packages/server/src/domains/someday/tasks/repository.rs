use super::entity::{self, ActiveModel, Entity};
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait,
    QueryFilter, QueryOrder,
};

pub struct SomedayTasksRepository {
    db: DatabaseConnection,
}

impl SomedayTasksRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Get all tasks for a specific list
    pub async fn get_by_list(&self, list_id: i32) -> Result<Vec<entity::Model>, DbErr> {
        Entity::find()
            .filter(entity::Column::ListId.eq(list_id))
            .order_by_asc(entity::Column::Position)
            .all(&self.db)
            .await
    }

    /// Get all someday tasks across all lists
    pub async fn get_all(&self) -> Result<Vec<entity::Model>, DbErr> {
        Entity::find()
            .order_by_asc(entity::Column::ListId)
            .order_by_asc(entity::Column::Position)
            .all(&self.db)
            .await
    }

    /// Create a new someday task
    pub async fn create(
        &self,
        list_id: i32,
        title: String,
        description: Option<String>,
        position: i32,
    ) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();
        let task = ActiveModel {
            list_id: ActiveValue::Set(list_id),
            title: ActiveValue::Set(title),
            description: ActiveValue::Set(description),
            completed: ActiveValue::Set(false),
            position: ActiveValue::Set(position),
            created_at: ActiveValue::Set(now),
            updated_at: ActiveValue::Set(now),
            ..Default::default()
        };
        task.insert(&self.db).await
    }

    /// Update a someday task
    pub async fn update(
        &self,
        id: i32,
        title: Option<String>,
        description: Option<Option<String>>,
        completed: Option<bool>,
        position: Option<i32>,
        list_id: Option<i32>,
    ) -> Result<entity::Model, DbErr> {
        let task = Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(DbErr::RecordNotFound("Someday task not found".to_string()))?;

        let mut task: ActiveModel = task.into();

        if let Some(title) = title {
            task.title = ActiveValue::Set(title);
        }
        if let Some(description) = description {
            task.description = ActiveValue::Set(description);
        }
        if let Some(completed) = completed {
            task.completed = ActiveValue::Set(completed);
        }
        if let Some(position) = position {
            task.position = ActiveValue::Set(position);
        }
        if let Some(list_id) = list_id {
            task.list_id = ActiveValue::Set(list_id);
        }

        task.updated_at = ActiveValue::Set(chrono::Utc::now());
        task.update(&self.db).await
    }

    /// Toggle task completion
    pub async fn toggle_completed(&self, id: i32) -> Result<entity::Model, DbErr> {
        let task = Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(DbErr::RecordNotFound("Someday task not found".to_string()))?;

        let mut task: ActiveModel = task.into();
        let current_completed = task.completed.clone().unwrap();
        task.completed = ActiveValue::Set(!current_completed);
        task.updated_at = ActiveValue::Set(chrono::Utc::now());
        task.update(&self.db).await
    }

    /// Delete a someday task
    pub async fn delete(&self, id: i32) -> Result<(), DbErr> {
        Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }
}
