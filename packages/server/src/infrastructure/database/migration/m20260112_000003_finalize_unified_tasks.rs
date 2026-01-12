use sea_orm_migration::prelude::{DbErr, DeriveMigrationName, MigrationTrait, SchemaManager};
use sea_orm_migration::sea_orm::{ConnectionTrait, DatabaseBackend, Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();

        // Note: Trash table stores snapshots of deleted tasks, not references
        // No need to update trash table as task_id is a string snapshot, not a foreign key

        // Rename old tables for safety (keep them for potential rollback)
        // SQLite doesn't support IF EXISTS with ALTER TABLE, so we'll ignore errors if tables don't exist
        let rename_tasks_sql = "ALTER TABLE tasks RENAME TO tasks_old";
        let _ = db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_tasks_sql.to_string(),
        ))
        .await; // Ignore error if tasks table doesn't exist

        let rename_someday_sql = "ALTER TABLE someday_tasks RENAME TO someday_tasks_old";
        let _ = db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_someday_sql.to_string(),
        ))
        .await; // Ignore error if someday_tasks table doesn't exist

        // Rename tasks_unified to tasks
        let rename_unified_sql = "ALTER TABLE tasks_unified RENAME TO tasks";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_unified_sql.to_string(),
        ))
        .await?;

        // PostgreSQL-specific operations
        if matches!(manager.get_database_backend(), DatabaseBackend::Postgres) {
            // Rename the sequence (PostgreSQL only)
            let rename_seq_sql = "ALTER SEQUENCE tasks_unified_id_seq RENAME TO tasks_id_seq";
            db.execute(Statement::from_string(
                manager.get_database_backend(),
                rename_seq_sql.to_string(),
            ))
            .await?;

            // Update index names (PostgreSQL syntax)
            let rename_idx1_sql =
                "ALTER INDEX idx_tasks_unified_date RENAME TO idx_tasks_date";
            db.execute(Statement::from_string(
                manager.get_database_backend(),
                rename_idx1_sql.to_string(),
            ))
            .await?;

            let rename_idx2_sql =
                "ALTER INDEX idx_tasks_unified_list_position RENAME TO idx_tasks_list_position";
            db.execute(Statement::from_string(
                manager.get_database_backend(),
                rename_idx2_sql.to_string(),
            ))
            .await?;

            // Update foreign key names (PostgreSQL only)
            let rename_fk_sql =
                "ALTER TABLE tasks RENAME CONSTRAINT fk_tasks_unified_list_id TO fk_tasks_list_id";
            db.execute(Statement::from_string(
                manager.get_database_backend(),
                rename_fk_sql.to_string(),
            ))
            .await?;
        }

        // Drop old tables (commented out for safety - uncomment after verification)
        // let drop_tasks_old_sql = "DROP TABLE IF EXISTS tasks_old CASCADE";
        // db.execute(Statement::from_string(
        //     manager.get_database_backend(),
        //     drop_tasks_old_sql.to_string(),
        // ))
        // .await?;

        // let drop_someday_old_sql = "DROP TABLE IF EXISTS someday_tasks_old CASCADE";
        // db.execute(Statement::from_string(
        //     manager.get_database_backend(),
        //     drop_someday_old_sql.to_string(),
        // ))
        // .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();

        // Rollback: rename tasks back to tasks_unified
        let rename_back_sql = "ALTER TABLE tasks RENAME TO tasks_unified";
        let _ = db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_back_sql.to_string(),
        ))
        .await; // Ignore error if tasks table doesn't exist

        // Restore old tables
        let restore_tasks_sql = "ALTER TABLE tasks_old RENAME TO tasks";
        let _ = db.execute(Statement::from_string(
            manager.get_database_backend(),
            restore_tasks_sql.to_string(),
        ))
        .await; // Ignore error if tasks_old doesn't exist

        let restore_someday_sql = "ALTER TABLE someday_tasks_old RENAME TO someday_tasks";
        let _ = db.execute(Statement::from_string(
            manager.get_database_backend(),
            restore_someday_sql.to_string(),
        ))
        .await; // Ignore error if someday_tasks_old doesn't exist

        // PostgreSQL-specific rollback
        if matches!(manager.get_database_backend(), DatabaseBackend::Postgres) {
            // Rename sequence back (PostgreSQL only)
            let rename_seq_back_sql = "ALTER SEQUENCE tasks_id_seq RENAME TO tasks_unified_id_seq";
            let _ = db.execute(Statement::from_string(
                manager.get_database_backend(),
                rename_seq_back_sql.to_string(),
            ))
            .await; // Ignore error if sequence doesn't exist
        }

        Ok(())
    }
}
