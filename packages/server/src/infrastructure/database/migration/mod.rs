pub use sea_orm_migration::{MigrationTrait, MigratorTrait};

mod m20250101_000001_create_tasks_table;
mod m20250102_000001_add_date_to_tasks;
mod m20260108_000001_create_settings_table;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250101_000001_create_tasks_table::Migration),
            Box::new(m20250102_000001_add_date_to_tasks::Migration),
            Box::new(m20260108_000001_create_settings_table::Migration),
        ]
    }
}
