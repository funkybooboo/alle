use super::entity;
use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct SomedayTask {
    pub id: i32,
    pub list_id: i32,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub position: i32,
}

impl From<entity::Model> for SomedayTask {
    fn from(model: entity::Model) -> Self {
        Self {
            id: model.id,
            list_id: model.list_id,
            title: model.title,
            description: model.description,
            completed: model.completed,
            position: model.position,
        }
    }
}

#[derive(InputObject)]
pub struct CreateSomedayTaskInput {
    pub list_id: i32,
    pub title: String,
    pub description: Option<String>,
    pub position: i32,
}

#[derive(InputObject)]
pub struct UpdateSomedayTaskInput {
    pub id: i32,
    pub title: Option<String>,
    pub description: Option<String>,
    pub completed: Option<bool>,
    pub position: Option<i32>,
    pub list_id: Option<i32>,
}
