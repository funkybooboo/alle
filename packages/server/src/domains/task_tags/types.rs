use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct TaskTag {
    pub id: i32,
    pub task_id: i32,
    pub tag_name: String,
    pub created_at: String,
}

impl From<super::entity::Model> for TaskTag {
    fn from(model: super::entity::Model) -> Self {
        Self {
            id: model.id,
            task_id: model.task_id,
            tag_name: model.tag_name,
            created_at: model.created_at.to_string(),
        }
    }
}

#[derive(InputObject)]
pub struct AddTaskTagInput {
    pub task_id: i32,
    pub tag_name: String,
}
