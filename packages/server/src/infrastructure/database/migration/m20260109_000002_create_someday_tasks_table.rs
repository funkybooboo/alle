use sea_orm_migration::prelude::{
    DbErr, DeriveIden, DeriveMigrationName, ForeignKey, ForeignKeyAction, MigrationTrait,
    SchemaManager, Table,
};
use sea_orm_migration::schema::{boolean, integer, pk_auto, string, text, timestamp_with_time_zone};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(SomedayTasks::Table)
                    .if_not_exists()
                    .col(pk_auto(SomedayTasks::Id))
                    .col(integer(SomedayTasks::ListId))
                    .col(string(SomedayTasks::Title))
                    .col(text(SomedayTasks::Description).null())
                    .col(boolean(SomedayTasks::Completed).default(false))
                    .col(integer(SomedayTasks::Position))
                    .col(timestamp_with_time_zone(SomedayTasks::CreatedAt))
                    .col(timestamp_with_time_zone(SomedayTasks::UpdatedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_someday_tasks_list_id")
                            .from(SomedayTasks::Table, SomedayTasks::ListId)
                            .to(SomedayLists::Table, SomedayLists::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(SomedayTasks::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum SomedayTasks {
    Table,
    Id,
    ListId,
    Title,
    Description,
    Completed,
    Position,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum SomedayLists {
    Table,
    Id,
}
