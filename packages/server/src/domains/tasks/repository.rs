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

    /// Create a new task (calendar or someday)
    pub async fn create(
        &self,
        title: String,
        date: Option<chrono::DateTime<chrono::Utc>>,
        list_id: Option<i32>,
        position: Option<i32>,
        notes: Option<String>,
        color: Option<String>,
    ) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();

        let new_task = entity::ActiveModel {
            title: Set(title),
            completed: Set(false),
            date: Set(date),
            list_id: Set(list_id),
            position: Set(position),
            notes: Set(notes),
            color: Set(color),
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

    /// Update a task with any combination of fields
    pub async fn update(
        &self,
        id: i32,
        title: Option<String>,
        completed: Option<bool>,
        date: Option<Option<chrono::DateTime<chrono::Utc>>>,
        list_id: Option<Option<i32>>,
        position: Option<Option<i32>>,
        notes: Option<Option<String>>,
        color: Option<Option<String>>,
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

        if let Some(new_list_id) = list_id {
            task_active.list_id = Set(new_list_id);
        }

        if let Some(new_position) = position {
            task_active.position = Set(new_position);
        }

        if let Some(new_notes) = notes {
            task_active.notes = Set(new_notes);
        }

        if let Some(new_color) = color {
            task_active.color = Set(new_color);
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
