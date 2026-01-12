use sea_orm_migration::prelude::{
    DbErr, DeriveIden, DeriveMigrationName, ForeignKey, ForeignKeyAction, MigrationTrait,
    SchemaManager, Table,
};
use sea_orm_migration::sea_orm::{ConnectionTrait, DatabaseBackend, Statement};
use sea_orm_migration::schema::{
    boolean, integer, pk_auto, string, text, timestamp_with_time_zone,
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();

        // Drop old tables if they exist
        let _ = manager
            .drop_table(Table::drop().table(Tasks::Table).if_exists().to_owned())
            .await;
        let _ = manager
            .drop_table(Table::drop().table(TasksOld::Table).if_exists().to_owned())
            .await;
        let _ = manager
            .drop_table(Table::drop().table(SomedayTasksOld::Table).if_exists().to_owned())
            .await;

        // Create unified tasks table with proper nullable columns
        // For SQLite, we'll use raw SQL to avoid the "NOT NULL NULL" bug
        if matches!(manager.get_database_backend(), DatabaseBackend::Sqlite) {
            let create_sql = r#"
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    completed INTEGER NOT NULL DEFAULT 0,
                    date TEXT,
                    list_id INTEGER,
                    position INTEGER,
                    notes TEXT,
                    color TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (list_id) REFERENCES someday_lists (id) ON DELETE SET NULL ON UPDATE CASCADE
                )
            "#;
            db.execute(Statement::from_string(
                manager.get_database_backend(),
                create_sql.to_string(),
            ))
            .await?;

            // Create indexes
            db.execute(Statement::from_string(
                manager.get_database_backend(),
                "CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date)".to_string(),
            ))
            .await?;

            db.execute(Statement::from_string(
                manager.get_database_backend(),
                "CREATE INDEX IF NOT EXISTS idx_tasks_list_position ON tasks(list_id, position)".to_string(),
            ))
            .await?;
        } else {
            // PostgreSQL - use schema builder
            manager
                .create_table(
                    Table::create()
                        .table(Tasks::Table)
                        .if_not_exists()
                        .col(pk_auto(Tasks::Id))
                        .col(string(Tasks::Title))
                        .col(boolean(Tasks::Completed).default(false))
                        .col(timestamp_with_time_zone(Tasks::Date).null())
                        .col(integer(Tasks::ListId).null())
                        .col(integer(Tasks::Position).null())
                        .col(text(Tasks::Notes).null())
                        .col(string(Tasks::Color).null())
                        .col(timestamp_with_time_zone(Tasks::CreatedAt))
                        .col(timestamp_with_time_zone(Tasks::UpdatedAt))
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_tasks_list_id")
                                .from(Tasks::Table, Tasks::ListId)
                                .to(SomedayLists::Table, SomedayLists::Id)
                                .on_delete(ForeignKeyAction::SetNull)
                                .on_update(ForeignKeyAction::Cascade),
                        )
                        .to_owned(),
                )
                .await?;
        }

        // Create task_tags table
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
                            .to(Tasks::Table, Tasks::Id)
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
                            .to(Tasks::Table, Tasks::Id)
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
                    .col(string(TaskAttachments::StoragePath))
                    .col(timestamp_with_time_zone(TaskAttachments::UploadedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_task_attachments_task_id")
                            .from(TaskAttachments::Table, TaskAttachments::TaskId)
                            .to(Tasks::Table, Tasks::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create tag_presets table
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

        // Create color_presets table
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
            .drop_table(Table::drop().table(Tasks::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Tasks {
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
enum TasksOld {
    Table,
}

#[derive(DeriveIden)]
enum SomedayTasksOld {
    Table,
}

#[derive(DeriveIden)]
enum SomedayLists {
    Table,
    Id,
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
