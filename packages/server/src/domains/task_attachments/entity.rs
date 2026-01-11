use sea_orm::entity::prelude::{
    ActiveModelBehavior, DateTimeUtc, DeriveEntityModel, DerivePrimaryKey, DeriveRelation,
    EnumIter, PrimaryKeyTrait,
};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "task_attachments")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub task_id: i32,
    pub file_name: String,
    pub file_size: i32,
    pub mime_type: String,
    pub storage_path: String,
    pub uploaded_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
