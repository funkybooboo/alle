use super::entity::{self, ActiveModel, Entity};
use sea_orm::{ActiveModelTrait, ActiveValue, DatabaseConnection, DbErr, EntityTrait, QueryOrder};

pub struct SomedayListsRepository {
    db: DatabaseConnection,
}

impl SomedayListsRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Get all someday lists ordered by position
    pub async fn get_all(&self) -> Result<Vec<entity::Model>, DbErr> {
        Entity::find()
            .order_by_asc(entity::Column::Position)
            .all(&self.db)
            .await
    }

    /// Create a new someday list
    pub async fn create(&self, name: String, position: i32) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();
        let list = ActiveModel {
            name: ActiveValue::Set(name),
            position: ActiveValue::Set(position),
            created_at: ActiveValue::Set(now),
            updated_at: ActiveValue::Set(now),
            ..Default::default()
        };
        list.insert(&self.db).await
    }

    /// Update a someday list
    pub async fn update(
        &self,
        id: i32,
        name: Option<String>,
        position: Option<i32>,
    ) -> Result<entity::Model, DbErr> {
        let list = Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(DbErr::RecordNotFound("Someday list not found".to_string()))?;

        let mut list: ActiveModel = list.into();

        if let Some(name) = name {
            list.name = ActiveValue::Set(name);
        }
        if let Some(position) = position {
            list.position = ActiveValue::Set(position);
        }

        list.updated_at = ActiveValue::Set(chrono::Utc::now());
        list.update(&self.db).await
    }

    /// Delete a someday list (will cascade delete tasks)
    pub async fn delete(&self, id: i32) -> Result<(), DbErr> {
        Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }
}
