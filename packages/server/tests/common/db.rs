//! Test database helpers
//!
//! Note: Not all functions are used in every test file, which is expected for shared test utilities.

#![allow(dead_code)]

use alle_server::migration::Migrator;
use sea_orm::{Database, DatabaseConnection, DbErr};
use sea_orm_migration::MigratorTrait;

pub enum TestDatabase {
    InMemory,
    Postgres,
    MySQL,
}

/// Set up a test database with migrations
pub async fn setup_test_db(db_type: TestDatabase) -> Result<DatabaseConnection, DbErr> {
    let db = match db_type {
        TestDatabase::InMemory => Database::connect("sqlite::memory:").await?,
        TestDatabase::Postgres => {
            let url = std::env::var("TEST_DATABASE_URL_POSTGRES").unwrap_or_else(|_| {
                "postgres://alle_test:test_password@localhost:5433/alle_test".to_string()
            });
            Database::connect(&url).await?
        }
        TestDatabase::MySQL => {
            let url = std::env::var("TEST_DATABASE_URL_MYSQL").unwrap_or_else(|_| {
                "mysql://alle_test:test_password@localhost:3307/alle_test".to_string()
            });
            Database::connect(&url).await?
        }
    };

    Migrator::up(&db, None).await?;
    Ok(db)
}

/// Tear down test database by rolling back migrations
pub async fn teardown_test_db(db: &DatabaseConnection) -> Result<(), DbErr> {
    Migrator::down(db, None).await?;
    Ok(())
}

/// Create a fresh in-memory database for quick tests
pub async fn fresh_in_memory_db() -> DatabaseConnection {
    setup_test_db(TestDatabase::InMemory)
        .await
        .expect("Failed to create in-memory test database")
}
