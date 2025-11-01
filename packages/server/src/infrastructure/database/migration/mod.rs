pub use sea_orm_migration::{MigrationTrait, MigratorTrait};

mod m20250101_000001_create_tasks_table;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![Box::new(m20250101_000001_create_tasks_table::Migration)]
    }
}
