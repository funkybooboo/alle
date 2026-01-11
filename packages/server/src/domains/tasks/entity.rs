use sea_orm::entity::prelude::{
    ActiveModelBehavior, DateTimeUtc, DeriveEntityModel, DerivePrimaryKey, DeriveRelation,
    EnumIter, PrimaryKeyTrait,
};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "tasks")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub title: String,
    pub completed: bool,
    // Context fields - flexible for calendar or someday
    pub date: Option<DateTimeUtc>,         // NULL for someday tasks
    pub list_id: Option<i32>,              // NULL for calendar tasks
    pub position: Option<i32>,             // NULL for calendar tasks
    // Enhanced metadata
    pub notes: Option<String>,
    pub color: Option<String>,
    // Timestamps
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
