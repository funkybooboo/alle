pub use sea_orm_migration::{MigrationTrait, MigratorTrait};

mod m20250101_000001_create_tasks_table;
mod m20250102_000001_add_date_to_tasks;
mod m20260108_000001_create_settings_table;
mod m20260109_000001_create_someday_lists_table;
mod m20260109_000002_create_someday_tasks_table;
mod m20260110_000001_create_trash_table;
mod m20260111_000001_add_theme_to_settings;
mod m20260112_000001_create_unified_tasks;
mod m20260112_000002_migrate_tasks_data;
mod m20260112_000003_finalize_unified_tasks;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250101_000001_create_tasks_table::Migration),
            Box::new(m20250102_000001_add_date_to_tasks::Migration),
            Box::new(m20260108_000001_create_settings_table::Migration),
            Box::new(m20260109_000001_create_someday_lists_table::Migration),
            Box::new(m20260109_000002_create_someday_tasks_table::Migration),
            Box::new(m20260110_000001_create_trash_table::Migration),
            Box::new(m20260111_000001_add_theme_to_settings::Migration),
            Box::new(m20260112_000001_create_unified_tasks::Migration),
            Box::new(m20260112_000002_migrate_tasks_data::Migration),
            Box::new(m20260112_000003_finalize_unified_tasks::Migration),
        ]
    }
}
