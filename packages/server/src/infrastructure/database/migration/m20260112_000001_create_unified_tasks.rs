use sea_orm_migration::prelude::{
    DbErr, DeriveIden, DeriveMigrationName, ForeignKey, ForeignKeyAction, MigrationTrait,
    SchemaManager, Table,
};
use sea_orm_migration::schema::{
    boolean, integer, pk_auto, string, text, timestamp_with_time_zone,
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create unified tasks table
        manager
            .create_table(
                Table::create()
                    .table(TasksUnified::Table)
                    .if_not_exists()
                    .col(pk_auto(TasksUnified::Id))
                    .col(string(TasksUnified::Title))
                    .col(boolean(TasksUnified::Completed).default(false))
                    // Context fields - flexible for calendar or someday
                    .col(timestamp_with_time_zone(TasksUnified::Date).null())
                    .col(integer(TasksUnified::ListId).null())
                    .col(integer(TasksUnified::Position).null())
                    // Enhanced metadata
                    .col(text(TasksUnified::Notes).null())
                    .col(string(TasksUnified::Color).null())
                    // Timestamps
                    .col(timestamp_with_time_zone(TasksUnified::CreatedAt))
                    .col(timestamp_with_time_zone(TasksUnified::UpdatedAt))
                    // Foreign key to someday_lists
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_tasks_unified_list_id")
                            .from(TasksUnified::Table, TasksUnified::ListId)
                            .to(SomedayLists::Table, SomedayLists::Id)
                            .on_delete(ForeignKeyAction::SetNull)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create task_tags table (many-to-many)
        manager
            .create_table(
                Table::create()
                    .table(TaskTags::Table)
                    .if_not_exists()
                    .col(pk_auto(TaskTags::Id))
                    .col(integer(TaskTags::TaskId))
                    .col(string(TaskTags::TagName))
                    .col(timestamp_with_time_zone(TaskTags::CreatedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_task_tags_task_id")
                            .from(TaskTags::Table, TaskTags::TaskId)
                            .to(TasksUnified::Table, TasksUnified::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create task_links table
        manager
            .create_table(
                Table::create()
                    .table(TaskLinks::Table)
                    .if_not_exists()
                    .col(pk_auto(TaskLinks::Id))
                    .col(integer(TaskLinks::TaskId))
                    .col(text(TaskLinks::Url))
                    .col(string(TaskLinks::Title).null())
                    .col(integer(TaskLinks::Position))
                    .col(timestamp_with_time_zone(TaskLinks::CreatedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_task_links_task_id")
                            .from(TaskLinks::Table, TaskLinks::TaskId)
                            .to(TasksUnified::Table, TasksUnified::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create task_attachments table
        manager
            .create_table(
                Table::create()
                    .table(TaskAttachments::Table)
                    .if_not_exists()
                    .col(pk_auto(TaskAttachments::Id))
                    .col(integer(TaskAttachments::TaskId))
                    .col(string(TaskAttachments::FileName))
                    .col(integer(TaskAttachments::FileSize))
                    .col(string(TaskAttachments::MimeType))
                    .col(text(TaskAttachments::StoragePath))
                    .col(timestamp_with_time_zone(TaskAttachments::UploadedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_task_attachments_task_id")
                            .from(TaskAttachments::Table, TaskAttachments::TaskId)
                            .to(TasksUnified::Table, TasksUnified::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create tag_presets table (global tag management)
        manager
            .create_table(
                Table::create()
                    .table(TagPresets::Table)
                    .if_not_exists()
                    .col(pk_auto(TagPresets::Id))
                    .col(string(TagPresets::Name).unique_key())
                    .col(integer(TagPresets::UsageCount).default(0))
                    .col(timestamp_with_time_zone(TagPresets::CreatedAt))
                    .to_owned(),
            )
            .await?;

        // Create color_presets table (color palette management)
        manager
            .create_table(
                Table::create()
                    .table(ColorPresets::Table)
                    .if_not_exists()
                    .col(pk_auto(ColorPresets::Id))
                    .col(string(ColorPresets::Name))
                    .col(string(ColorPresets::HexValue))
                    .col(integer(ColorPresets::Position).unique_key())
                    .col(timestamp_with_time_zone(ColorPresets::CreatedAt))
                    .to_owned(),
            )
            .await?;

        // Create indexes
        manager
            .create_index(
                sea_orm_migration::prelude::Index::create()
                    .name("idx_tasks_unified_date")
                    .table(TasksUnified::Table)
                    .col(TasksUnified::Date)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                sea_orm_migration::prelude::Index::create()
                    .name("idx_tasks_unified_list_position")
                    .table(TasksUnified::Table)
                    .col(TasksUnified::ListId)
                    .col(TasksUnified::Position)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                sea_orm_migration::prelude::Index::create()
                    .name("idx_task_tags_name")
                    .table(TaskTags::Table)
                    .col(TaskTags::TagName)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                sea_orm_migration::prelude::Index::create()
                    .name("idx_task_tags_task_id")
                    .table(TaskTags::Table)
                    .col(TaskTags::TaskId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                sea_orm_migration::prelude::Index::create()
                    .name("idx_task_attachments_task_id")
                    .table(TaskAttachments::Table)
                    .col(TaskAttachments::TaskId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                sea_orm_migration::prelude::Index::create()
                    .name("idx_tag_presets_name")
                    .table(TagPresets::Table)
                    .col(TagPresets::Name)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                sea_orm_migration::prelude::Index::create()
                    .name("idx_color_presets_position")
                    .table(ColorPresets::Table)
                    .col(ColorPresets::Position)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ColorPresets::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(TagPresets::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(TaskAttachments::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(TaskLinks::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(TaskTags::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(TasksUnified::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum TasksUnified {
    Table,
    Id,
    Title,
    Completed,
    Date,
    ListId,
    Position,
    Notes,
    Color,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum TaskTags {
    Table,
    Id,
    TaskId,
    TagName,
    CreatedAt,
}

#[derive(DeriveIden)]
enum TaskLinks {
    Table,
    Id,
    TaskId,
    Url,
    Title,
    Position,
    CreatedAt,
}

#[derive(DeriveIden)]
enum TaskAttachments {
    Table,
    Id,
    TaskId,
    FileName,
    FileSize,
    MimeType,
    StoragePath,
    UploadedAt,
}

#[derive(DeriveIden)]
enum TagPresets {
    Table,
    Id,
    Name,
    UsageCount,
    CreatedAt,
}

#[derive(DeriveIden)]
enum ColorPresets {
    Table,
    Id,
    Name,
    HexValue,
    Position,
    CreatedAt,
}

#[derive(DeriveIden)]
enum SomedayLists {
    Table,
    Id,
}
