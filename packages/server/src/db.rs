use sea_orm::{Database, DatabaseConnection, DbErr};

pub async fn establish_connection(database_url: &str) -> Result<DatabaseConnection, DbErr> {
    Database::connect(database_url).await
}

#[cfg(test)]
pub async fn establish_in_memory_connection() -> Result<DatabaseConnection, DbErr> {
    use crate::migration::Migrator;
    use sea_orm_migration::MigratorTrait;

    let db = Database::connect("sqlite::memory:").await?;
    Migrator::up(&db, None).await?;
    Ok(db)
}
