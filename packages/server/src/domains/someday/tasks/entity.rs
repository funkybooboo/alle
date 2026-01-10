use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "someday_tasks")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub list_id: i32,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub position: i32,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::super::lists::entity::Entity",
        from = "Column::ListId",
        to = "super::super::lists::entity::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    SomedayList,
}

impl Related<super::super::lists::entity::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SomedayList.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
