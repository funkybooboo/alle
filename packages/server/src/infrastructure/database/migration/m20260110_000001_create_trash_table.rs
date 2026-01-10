use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Trash::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Trash::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Trash::TaskId).string().not_null())
                    .col(ColumnDef::new(Trash::TaskText).string().not_null())
                    .col(ColumnDef::new(Trash::TaskDate).date_time().not_null())
                    .col(ColumnDef::new(Trash::TaskCompleted).boolean().not_null())
                    .col(ColumnDef::new(Trash::DeletedAt).date_time().not_null())
                    .col(ColumnDef::new(Trash::TaskType).string().not_null()) // "calendar" or "someday"
                    .col(ColumnDef::new(Trash::SomedayListId).integer().null()) // For someday tasks
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Trash::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Trash {
    Table,
    Id,
    TaskId,
    TaskText,
    TaskDate,
    TaskCompleted,
    DeletedAt,
    TaskType,
    SomedayListId,
}
