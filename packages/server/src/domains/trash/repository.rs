use chrono::Utc;
use sea_orm::prelude::DateTimeUtc;
use sea_orm::*;

use super::entity::{self, Entity as Trash};

pub struct TrashRepository {
    db: DatabaseConnection,
}

impl TrashRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn get_all(&self) -> Result<Vec<entity::Model>, DbErr> {
        Trash::find().all(&self.db).await
    }

    pub async fn create(
        &self,
        task_id: String,
        task_text: String,
        task_date: DateTimeUtc,
        task_completed: bool,
        task_type: String,
        someday_list_id: Option<i32>,
    ) -> Result<entity::Model, DbErr> {
        let trash = entity::ActiveModel {
            task_id: Set(task_id),
            task_text: Set(task_text),
            task_date: Set(task_date),
            task_completed: Set(task_completed),
            deleted_at: Set(Utc::now()),
            task_type: Set(task_type),
            someday_list_id: Set(someday_list_id),
            ..Default::default()
        };

        trash.insert(&self.db).await
    }

    pub async fn delete(&self, id: i32) -> Result<(), DbErr> {
        Trash::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    pub async fn clean_old(&self) -> Result<(), DbErr> {
        let week_ago = Utc::now() - chrono::Duration::days(7);
        Trash::delete_many()
            .filter(entity::Column::DeletedAt.lt(week_ago))
            .exec(&self.db)
            .await?;
        Ok(())
    }
}
