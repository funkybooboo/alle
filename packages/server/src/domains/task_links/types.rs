use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct TaskLink {
    pub id: i32,
    pub task_id: i32,
    pub url: String,
    pub title: Option<String>,
    pub position: i32,
    pub created_at: String,
}

impl From<super::entity::Model> for TaskLink {
    fn from(model: super::entity::Model) -> Self {
        Self {
            id: model.id,
            task_id: model.task_id,
            url: model.url,
            title: model.title,
            position: model.position,
            created_at: model.created_at.to_string(),
        }
    }
}

#[derive(InputObject)]
pub struct AddTaskLinkInput {
    pub task_id: i32,
    pub url: String,
    pub title: Option<String>,
}

#[derive(InputObject)]
pub struct UpdateTaskLinkInput {
    pub title: Option<String>,
    pub url: Option<String>,
}
