use async_graphql::*;
use chrono::Utc;

use super::entity;

#[derive(SimpleObject)]
pub struct TrashItem {
    pub id: i32,
    pub task_id: String,
    pub task_text: String,
    pub task_date: String,
    pub task_completed: bool,
    pub deleted_at: String,
    pub task_type: String,
    pub someday_list_id: Option<i32>,
}

impl From<entity::Model> for TrashItem {
    fn from(model: entity::Model) -> Self {
        Self {
            id: model.id,
            task_id: model.task_id,
            task_text: model.task_text,
            task_date: model.task_date.to_rfc3339(),
            task_completed: model.task_completed,
            deleted_at: model.deleted_at.to_rfc3339(),
            task_type: model.task_type,
            someday_list_id: model.someday_list_id,
        }
    }
}

#[derive(InputObject)]
pub struct CreateTrashInput {
    pub task_id: String,
    pub task_text: String,
    pub task_date: String,
    pub task_completed: bool,
    pub task_type: String,
    pub someday_list_id: Option<i32>,
}
