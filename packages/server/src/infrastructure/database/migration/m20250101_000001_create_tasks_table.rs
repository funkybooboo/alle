use sea_orm_migration::prelude::{
    DbErr, DeriveIden, DeriveMigrationName, MigrationTrait, SchemaManager, Table,
};
use sea_orm_migration::schema::{boolean, pk_auto, string, timestamp_with_time_zone};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Tasks::Table)
                    .if_not_exists()
                    .col(pk_auto(Tasks::Id))
                    .col(string(Tasks::Title))
                    .col(boolean(Tasks::Completed).default(false))
                    .col(timestamp_with_time_zone(Tasks::CreatedAt))
                    .col(timestamp_with_time_zone(Tasks::UpdatedAt))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Tasks::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Tasks {
    Table,
    Id,
    Title,
    Completed,
    CreatedAt,
    UpdatedAt,
}
