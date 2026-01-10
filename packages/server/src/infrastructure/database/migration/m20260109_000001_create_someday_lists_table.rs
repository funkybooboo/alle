use sea_orm_migration::prelude::{
    DbErr, DeriveIden, DeriveMigrationName, MigrationTrait, SchemaManager, Table,
};
use sea_orm_migration::schema::{integer, pk_auto, string, timestamp_with_time_zone};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(SomedayLists::Table)
                    .if_not_exists()
                    .col(pk_auto(SomedayLists::Id))
                    .col(string(SomedayLists::Name))
                    .col(integer(SomedayLists::Position))
                    .col(timestamp_with_time_zone(SomedayLists::CreatedAt))
                    .col(timestamp_with_time_zone(SomedayLists::UpdatedAt))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(SomedayLists::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum SomedayLists {
    Table,
    Id,
    Name,
    Position,
    CreatedAt,
    UpdatedAt,
}
