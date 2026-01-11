use sea_orm::entity::prelude::{
    ActiveModelBehavior, DateTimeUtc, DeriveEntityModel, DerivePrimaryKey, DeriveRelation,
    EnumIter, PrimaryKeyTrait,
};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "tag_presets")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub name: String,
    pub usage_count: i32,
    pub created_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
