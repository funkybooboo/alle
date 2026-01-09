use sea_orm_migration::prelude::{
    DbErr, DeriveIden, DeriveMigrationName, MigrationTrait, SchemaManager, Table,
};
use sea_orm_migration::schema::{boolean, integer, pk_auto, string, timestamp_with_time_zone};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Settings::Table)
                    .if_not_exists()
                    .col(pk_auto(Settings::Id))
                    .col(integer(Settings::ColumnMinWidth).default(300))
                    .col(boolean(Settings::TodayShowsPrevious).default(false))
                    .col(integer(Settings::SingleArrowDays).default(1))
                    .col(integer(Settings::DoubleArrowDays).default(7))
                    .col(
                        string(Settings::AutoColumnBreakpoints)
                            .default(r#"{"small":640,"medium":1024,"large":1536,"xlarge":2048}"#),
                    )
                    .col(
                        string(Settings::AutoColumnCounts)
                            .default(r#"{"small":1,"medium":2,"large":3,"xlarge":5,"xxlarge":7}"#),
                    )
                    .col(integer(Settings::DrawerHeight).default(300))
                    .col(boolean(Settings::DrawerIsOpen).default(true))
                    .col(timestamp_with_time_zone(Settings::CreatedAt))
                    .col(timestamp_with_time_zone(Settings::UpdatedAt))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Settings::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Settings {
    Table,
    Id,
    ColumnMinWidth,
    TodayShowsPrevious,
    SingleArrowDays,
    DoubleArrowDays,
    AutoColumnBreakpoints,
    AutoColumnCounts,
    DrawerHeight,
    DrawerIsOpen,
    CreatedAt,
    UpdatedAt,
}
