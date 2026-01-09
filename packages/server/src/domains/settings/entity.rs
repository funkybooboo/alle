use sea_orm::entity::prelude::{
    ActiveModelBehavior, DateTimeUtc, DeriveEntityModel, DerivePrimaryKey, DeriveRelation,
    EnumIter, PrimaryKeyTrait,
};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "settings")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub column_min_width: i32,
    pub today_shows_previous: bool,
    pub single_arrow_days: i32,
    pub double_arrow_days: i32,
    pub auto_column_breakpoints: String, // JSON
    pub auto_column_counts: String,      // JSON
    pub drawer_height: i32,
    pub drawer_is_open: bool,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
