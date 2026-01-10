use super::entity;
use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct SomedayList {
    pub id: i32,
    pub name: String,
    pub position: i32,
}

impl From<entity::Model> for SomedayList {
    fn from(model: entity::Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
            position: model.position,
        }
    }
}

#[derive(InputObject)]
pub struct CreateSomedayListInput {
    pub name: String,
    pub position: i32,
}

#[derive(InputObject)]
pub struct UpdateSomedayListInput {
    pub id: i32,
    pub name: Option<String>,
    pub position: Option<i32>,
}
