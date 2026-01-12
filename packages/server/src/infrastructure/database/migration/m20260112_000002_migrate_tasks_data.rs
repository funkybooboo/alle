use sea_orm_migration::prelude::{DbErr, DeriveMigrationName, MigrationTrait, SchemaManager};
use sea_orm_migration::sea_orm::{ConnectionTrait, Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();

        // Migrate regular tasks to tasks_unified (set date, leave list_id/position NULL)
        let sql = r#"
            INSERT INTO tasks_unified (id, title, completed, date, list_id, position, notes, color, created_at, updated_at)
            SELECT
                id,
                title,
                completed,
                date,
                NULL as list_id,
                NULL as position,
                NULL as notes,
                NULL as color,
                created_at,
                updated_at
            FROM tasks
        "#;

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            sql.to_string(),
        ))
        .await?;

        // Get the max ID from regular tasks to offset someday tasks IDs
        let max_id_sql = "SELECT COALESCE(MAX(id), 0) FROM tasks";
        let max_id_result = db
            .query_one(Statement::from_string(
                manager.get_database_backend(),
                max_id_sql.to_string(),
            ))
            .await?;

        let max_id: i32 = if let Some(row) = max_id_result {
            row.try_get("", "max").unwrap_or(0)
        } else {
            0
        };

        // Migrate someday_tasks to tasks_unified (set list_id/position, leave date NULL or use if exists)
        // Offset IDs to avoid conflicts
        let sql = format!(
            r#"
            INSERT INTO tasks_unified (id, title, completed, date, list_id, position, notes, color, created_at, updated_at)
            SELECT
                id + {},
                title,
                completed,
                NULL as date,
                list_id,
                position,
                description as notes,
                NULL as color,
                created_at,
                updated_at
            FROM someday_tasks
        "#,
            max_id
        );

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            sql,
        ))
        .await?;

        // Update sequence for tasks_unified to continue from max ID (PostgreSQL only)
        // SQLite handles AUTOINCREMENT automatically
        use sea_orm_migration::sea_orm::DatabaseBackend;

        if matches!(manager.get_database_backend(), DatabaseBackend::Postgres) {
            let new_max_sql = "SELECT COALESCE(MAX(id), 0) + 1 FROM tasks_unified";
            let new_max_result = db
                .query_one(Statement::from_string(
                    manager.get_database_backend(),
                    new_max_sql.to_string(),
                ))
                .await?;

            let new_max: i32 = if let Some(row) = new_max_result {
                row.try_get("", "?column?").unwrap_or(1)
            } else {
                1
            };

            let seq_sql = format!(
                "ALTER SEQUENCE tasks_unified_id_seq RESTART WITH {}",
                new_max
            );

            db.execute(Statement::from_string(
                manager.get_database_backend(),
                seq_sql,
            ))
            .await?;
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();

        // Clear the unified table (data will be preserved in original tables)
        // Use DELETE for SQLite compatibility (TRUNCATE with CASCADE is PostgreSQL-specific)
        let sql = "DELETE FROM tasks_unified";

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            sql.to_string(),
        ))
        .await?;

        Ok(())
    }
}
