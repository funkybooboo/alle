use super::entity;
use sea_orm::{
    ActiveModelTrait, DatabaseConnection, DbErr, EntityTrait, QueryOrder, Set,
};

pub struct ColorPresetRepository {
    db: DatabaseConnection,
}

impl ColorPresetRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// Create a new color preset
    pub async fn create(&self, name: String, hex_value: String) -> Result<entity::Model, DbErr> {
        let now = chrono::Utc::now();

        // Get next position
        let max_position = entity::Entity::find()
            .all(&self.db)
            .await?
            .iter()
            .map(|c| c.position)
            .max()
            .unwrap_or(-1);

        let new_preset = entity::ActiveModel {
            name: Set(name),
            hex_value: Set(hex_value),
            position: Set(max_position + 1),
            created_at: Set(now),
            ..Default::default()
        };

        new_preset.insert(&self.db).await
    }

    /// Get all color presets ordered by position
    pub async fn find_all(&self) -> Result<Vec<entity::Model>, DbErr> {
        entity::Entity::find()
            .order_by_asc(entity::Column::Position)
            .all(&self.db)
            .await
    }

    /// Update a color preset
    pub async fn update(
        &self,
        id: i32,
        name: Option<String>,
        hex_value: Option<String>,
    ) -> Result<entity::Model, DbErr> {
        let preset = entity::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or(DbErr::RecordNotFound("Color preset not found".to_string()))?;

        let mut preset_active: entity::ActiveModel = preset.into();

        if let Some(new_name) = name {
            preset_active.name = Set(new_name);
        }

        if let Some(new_hex) = hex_value {
            preset_active.hex_value = Set(new_hex);
        }

        preset_active.update(&self.db).await
    }

    /// Reorder color presets
    pub async fn reorder(&self, ids: Vec<i32>) -> Result<Vec<entity::Model>, DbErr> {
        // Update positions for all presets in the order provided
        for (index, id) in ids.iter().enumerate() {
            let preset = entity::Entity::find_by_id(*id)
                .one(&self.db)
                .await?
                .ok_or(DbErr::RecordNotFound(format!("Color preset {} not found", id)))?;

            let mut preset_active: entity::ActiveModel = preset.into();
            preset_active.position = Set(index as i32);
            preset_active.update(&self.db).await?;
        }

        // Return all presets in new order
        self.find_all().await
    }

    /// Delete a color preset
    pub async fn delete(&self, id: i32) -> Result<u64, DbErr> {
        let result = entity::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(result.rows_affected)
    }
}
