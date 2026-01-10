use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "someday_lists")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub position: i32,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::super::tasks::entity::Entity")]
    SomedayTasks,
}

impl Related<super::super::tasks::entity::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SomedayTasks.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
