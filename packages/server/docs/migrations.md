# Database Migrations

Migrations run automatically on server startup.

## Adding a Migration

1. Create file `src/infrastructure/database/migration/m{YYYYMMDD}_{NNNNNN}_description.rs`:

```rust
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .col(ColumnDef::new(Users::Id).integer().not_null().auto_increment().primary_key())
                    .col(ColumnDef::new(Users::Email).string().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    Email,
}
```

2. Register in `src/infrastructure/database/migration/mod.rs`:

```rust
vec![
    Box::new(m20250101_000001_create_tasks::Migration),
    Box::new(m20250124_000001_create_users::Migration), // Add here
]
```

3. Generate entity:

```bash
sea-orm-cli generate entity -o src/entities
```

4. Run migration:

```bash
cargo run  # Migrations run automatically
```

Check logs:
```
Running migrations...
Migrations completed successfully
```

## Troubleshooting

Migration errors - check syntax in `src/infrastructure/database/migration/` files.

View schema:
```bash
sqlite3 alle.db ".schema"  # SQLite
psql $ALLE_SERVER_DATABASE_URL -c "\d"  # PostgreSQL
```
