//! Test database helpers
//!
//! Note: Not all functions are used in every test file, which is expected for shared test utilities.

#![allow(dead_code)]

use alle_server::infrastructure::Migrator;
use sea_orm::{Database, DatabaseConnection, DbErr};
use sea_orm_migration::MigratorTrait;
use testcontainers::{runners::AsyncRunner, ContainerAsync};
use testcontainers_modules::{mysql::Mysql, postgres::Postgres};

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

/// Set up a PostgreSQL test database using testcontainers
/// Returns both the database connection and the container (which must be kept alive)
pub async fn setup_postgres_container(
) -> Result<(DatabaseConnection, ContainerAsync<Postgres>), DbErr> {
    let container = Postgres::default()
        .start()
        .await
        .expect("Failed to start Postgres container");

    let host = container.get_host().await.expect("Failed to get host");
    let port = container
        .get_host_port_ipv4(5432)
        .await
        .expect("Failed to get port");

    let connection_string = format!("postgres://postgres:postgres@{}:{}/postgres", host, port);

    let db = Database::connect(&connection_string).await?;
    Migrator::up(&db, None).await?;

    Ok((db, container))
}

/// Set up a MySQL test database using testcontainers
/// Returns both the database connection and the container (which must be kept alive)
pub async fn setup_mysql_container() -> Result<(DatabaseConnection, ContainerAsync<Mysql>), DbErr> {
    let container = Mysql::default()
        .start()
        .await
        .expect("Failed to start MySQL container");

    let host = container.get_host().await.expect("Failed to get host");
    let port = container
        .get_host_port_ipv4(3306)
        .await
        .expect("Failed to get port");

    // Testcontainers MySQL default credentials
    let connection_string = format!("mysql://root@{}:{}/test", host, port);

    // Retry connection with timeout instead of fixed sleep
    let db = retry_connect(&connection_string, 30, 500).await?;
    Migrator::up(&db, None).await?;

    Ok((db, container))
}

/// Retry database connection with configurable timeout and interval
///
/// # Arguments
/// * `connection_string` - Database connection string
/// * `max_retries` - Maximum number of connection attempts
/// * `retry_interval_ms` - Milliseconds to wait between retries
async fn retry_connect(
    connection_string: &str,
    max_retries: u32,
    retry_interval_ms: u64,
) -> Result<DatabaseConnection, DbErr> {
    let mut last_error = None;

    for attempt in 1..=max_retries {
        match Database::connect(connection_string).await {
            Ok(db) => return Ok(db),
            Err(e) => {
                last_error = Some(e);
                if attempt < max_retries {
                    tokio::time::sleep(tokio::time::Duration::from_millis(retry_interval_ms)).await;
                }
            }
        }
    }

    Err(last_error.unwrap_or_else(|| DbErr::Custom("Failed to connect after retries".to_string())))
}

/// Set up a SQLite test database using testcontainers (file-based for integration tests)
/// Returns both the database connection and a temp file path
pub async fn setup_sqlite_container() -> Result<DatabaseConnection, DbErr> {
    // For SQLite, we'll use a temporary file instead of in-memory for integration testing
    let temp_dir = std::env::temp_dir();
    let temp_file = temp_dir.join(format!("alle_test_{}.db", std::process::id()));
    let connection_string = format!("sqlite://{}?mode=rwc", temp_file.display());

    let db = Database::connect(&connection_string).await?;
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
