use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "trash")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub task_id: String,
    pub task_text: String,
    pub task_date: DateTimeUtc,
    pub task_completed: bool,
    pub deleted_at: DateTimeUtc,
    pub task_type: String, // "calendar" or "someday"
    pub someday_list_id: Option<i32>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
