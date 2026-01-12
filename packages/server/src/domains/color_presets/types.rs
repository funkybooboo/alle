use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct ColorPreset {
    pub id: i32,
    pub name: String,
    pub hex_value: String,
    pub position: i32,
    pub created_at: String,
}

impl From<super::entity::Model> for ColorPreset {
    fn from(model: super::entity::Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
            hex_value: model.hex_value,
            position: model.position,
            created_at: model.created_at.to_string(),
        }
    }
}

#[derive(InputObject)]
pub struct CreateColorPresetInput {
    pub name: String,
    pub hex_value: String,
}

#[derive(InputObject)]
pub struct UpdateColorPresetInput {
    pub name: Option<String>,
    pub hex_value: Option<String>,
}
