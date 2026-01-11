use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct Task {
    pub id: i32,
    pub title: String,
    pub completed: bool,
    // Context fields - flexible for calendar or someday
    pub date: Option<String>,        // NULL for someday tasks
    pub list_id: Option<i32>,        // NULL for calendar tasks
    pub position: Option<i32>,       // NULL for calendar tasks
    // Enhanced metadata
    pub notes: Option<String>,
    pub color: Option<String>,
    // Timestamps
    pub created_at: String,
    pub updated_at: String,
}

impl From<super::entity::Model> for Task {
    fn from(model: super::entity::Model) -> Self {
        Self {
            id: model.id,
            title: model.title,
            completed: model.completed,
            date: model.date.map(|d| d.to_string()),
            list_id: model.list_id,
            position: model.position,
            notes: model.notes,
            color: model.color,
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}

#[derive(InputObject)]
pub struct CreateTaskInput {
    pub title: String,
    // Calendar context
    pub date: Option<String>,
    // Someday context
    pub list_id: Option<i32>,
    pub position: Option<i32>,
    // Enhanced metadata
    pub notes: Option<String>,
    pub color: Option<String>,
}

#[derive(InputObject)]
pub struct UpdateTaskInput {
    pub title: Option<String>,
    pub completed: Option<bool>,
    pub date: Option<String>,
    pub list_id: Option<i32>,
    pub position: Option<i32>,
    pub notes: Option<String>,
    pub color: Option<String>,
}
