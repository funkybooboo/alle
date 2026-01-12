use super::entity;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, Set,
};

pub struct TagPresetRepository {
    db: DatabaseConnection,
}

impl TagPresetRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Create a new tag preset
    pub async fn create(&self, name: String) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();

        let new_preset = entity::ActiveModel {
            name: Set(name),
            usage_count: Set(0),
            created_at: Set(now),
            ..Default::default()
        };

        new_preset.insert(&self.db).await
    }

    /// Get all tag presets
    pub async fn find_all(&self) -> Result<Vec<entity::Model>, DbErr> {
        entity::Entity::find().all(&self.db).await
    }

    /// Find a tag preset by name
    pub async fn find_by_name(&self, name: &str) -> Result<Option<entity::Model>, DbErr> {
        entity::Entity::find()
            .filter(entity::Column::Name.eq(name))
            .one(&self.db)
            .await
    }

    /// Update tag preset name
    pub async fn update_name(&self, id: i32, new_name: String) -> Result<entity::Model, DbErr> {
        let preset = entity::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(DbErr::RecordNotFound("Tag preset not found".to_string()))?;

        let mut preset_active: entity::ActiveModel = preset.into();
        preset_active.name = Set(new_name);

        preset_active.update(&self.db).await
    }

    /// Increment usage count
    pub async fn increment_usage(&self, id: i32) -> Result<entity::Model, DbErr> {
        let preset = entity::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(DbErr::RecordNotFound("Tag preset not found".to_string()))?;

        let mut preset_active: entity::ActiveModel = preset.clone().into();
        preset_active.usage_count = Set(preset.usage_count + 1);

        preset_active.update(&self.db).await
    }

    /// Delete a tag preset
    pub async fn delete(&self, id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(result.rows_affected)
    }
}
