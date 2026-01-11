use sea_orm_migration::prelude::{DbErr, DeriveMigrationName, MigrationTrait, SchemaManager};
use sea_orm_migration::sea_orm::{ConnectionTrait, Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();

        // Update trash table to reference new unified tasks
        // Note: This assumes trash references the old tasks table
        let update_trash_sql = r#"
            UPDATE trash
            SET task_id = tasks_unified.id
            FROM tasks_unified
            WHERE trash.title = tasks_unified.title
                AND trash.completed = tasks_unified.completed
        "#;

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            update_trash_sql.to_string(),
        ))
        .await?;

        // Rename old tables for safety (keep them for potential rollback)
        let rename_tasks_sql = "ALTER TABLE IF EXISTS tasks RENAME TO tasks_old";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_tasks_sql.to_string(),
        ))
        .await?;

        let rename_someday_sql = "ALTER TABLE IF EXISTS someday_tasks RENAME TO someday_tasks_old";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_someday_sql.to_string(),
        ))
        .await?;

        // Rename tasks_unified to tasks
        let rename_unified_sql = "ALTER TABLE tasks_unified RENAME TO tasks";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_unified_sql.to_string(),
        ))
        .await?;

        // Rename the sequence
        let rename_seq_sql = "ALTER SEQUENCE tasks_unified_id_seq RENAME TO tasks_id_seq";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_seq_sql.to_string(),
        ))
        .await?;

        // Update index names
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

        // Update foreign key names
        let rename_fk_sql =
            "ALTER TABLE tasks RENAME CONSTRAINT fk_tasks_unified_list_id TO fk_tasks_list_id";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_fk_sql.to_string(),
        ))
        .await?;

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
        let rename_back_sql = "ALTER TABLE IF EXISTS tasks RENAME TO tasks_unified";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_back_sql.to_string(),
        ))
        .await?;

        // Restore old tables
        let restore_tasks_sql = "ALTER TABLE IF EXISTS tasks_old RENAME TO tasks";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            restore_tasks_sql.to_string(),
        ))
        .await?;

        let restore_someday_sql =
            "ALTER TABLE IF EXISTS someday_tasks_old RENAME TO someday_tasks";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            restore_someday_sql.to_string(),
        ))
        .await?;

        // Rename sequence back
        let rename_seq_back_sql = "ALTER SEQUENCE IF EXISTS tasks_id_seq RENAME TO tasks_unified_id_seq";
        db.execute(Statement::from_string(
            manager.get_database_backend(),
            rename_seq_back_sql.to_string(),
        ))
        .await?;

        Ok(())
    }
}
