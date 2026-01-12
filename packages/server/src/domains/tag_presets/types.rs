use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct TagPreset {
    pub id: i32,
    pub name: String,
    pub usage_count: i32,
    pub created_at: String,
}

impl From<super::entity::Model> for TagPreset {
    fn from(model: super::entity::Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
            usage_count: model.usage_count,
            created_at: model.created_at.to_string(),
        }
    }
}

#[derive(InputObject)]
pub struct CreateTagPresetInput {
    pub name: String,
}
