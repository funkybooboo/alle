use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct Task {
    pub id: i32,
    pub title: String,
    pub completed: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<super::entity::Model> for Task {
    fn from(model: super::entity::Model) -> Self {
        Self {
            id: model.id,
            title: model.title,
            completed: model.completed,
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}

#[derive(InputObject)]
pub struct CreateTaskInput {
    pub title: String,
}

#[derive(InputObject)]
pub struct UpdateTaskInput {
    pub title: Option<String>,
    pub completed: Option<bool>,
}
