# Adding New Domains

Guide for adding a new domain (entity) with GraphQL support in the domain-driven architecture.

## Domain Structure

Each domain is organized in `src/domains/<domain_name>/`:
```
src/domains/your_domain/
├── mod.rs              # Module exports
├── entity.rs           # SeaORM database entity
├── repository.rs       # Data access layer
├── types.rs            # GraphQL input/output types
├── queries.rs          # GraphQL queries
└── mutations.rs        # GraphQL mutations
```

## Steps

### 1. Create Database Migration

`src/infrastructure/database/migration/m20250101_000002_create_your_table.rs`:

```rust
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create()
                .table(YourTable::Table)
                .if_not_exists()
                .col(ColumnDef::new(YourTable::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(YourTable::Name).string().not_null())
                .col(ColumnDef::new(YourTable::CreatedAt).timestamp().not_null())
                .col(ColumnDef::new(YourTable::UpdatedAt).timestamp().not_null())
                .to_owned(),
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(YourTable::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
enum YourTable {
    Table,
    Id,
    Name,
    CreatedAt,
    UpdatedAt,
}
```

Add to `src/infrastructure/database/migration/mod.rs`:
```rust
vec![
    Box::new(m20250101_000001_create_tasks::Migration),
    Box::new(m20250101_000002_create_your_table::Migration),
]
```

### 2. Create Domain Directory

```bash
mkdir -p src/domains/your_domain
```

### 3. Create Entity

`src/domains/your_domain/entity.rs`:

```rust
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "your_table")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
```

### 4. Create Repository

`src/domains/your_domain/repository.rs`:

```rust
use sea_orm::*;
use super::entity::{self, Entity, Model};

pub struct YourDomainRepository {
    db: DatabaseConnection,
}

impl YourDomainRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    fn db(&self) -> &DatabaseConnection {
        &self.db
    }

    pub async fn create(&self, name: String) -> Result<Model, DbErr> {
        let now = chrono::Utc::now().naive_utc();
        let new_item = entity::ActiveModel {
            name: Set(name),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };
        new_item.insert(self.db()).await
    }

    pub async fn find_all(&self) -> Result<Vec<Model>, DbErr> {
        Entity::find().all(self.db()).await
    }

    pub async fn find_by_id(&self, id: i32) -> Result<Option<Model>, DbErr> {
        Entity::find_by_id(id).one(self.db()).await
    }
}
```

### 5. Create GraphQL Types

`src/domains/your_domain/types.rs`:

```rust
use async_graphql::*;
use super::entity::Model;

#[derive(SimpleObject, Clone)]
pub struct YourDomain {
    pub id: i32,
    pub name: String,
}

impl From<Model> for YourDomain {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
        }
    }
}

#[derive(InputObject)]
pub struct CreateYourDomainInput {
    pub name: String,
}
```

### 6. Create GraphQL Queries

`src/domains/your_domain/queries.rs`:

```rust
use async_graphql::*;
use std::sync::Arc;
use crate::infrastructure::AppContext;
use super::{YourDomainRepository, types::YourDomain};

#[derive(Default)]
pub struct YourDomainQueries;

#[Object]
impl YourDomainQueries {
    async fn your_domains(&self, ctx: &Context<'_>) -> Result<Vec<YourDomain>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let items = app_ctx.your_domain_repository.find_all().await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(items.into_iter().map(YourDomain::from).collect())
    }

    async fn your_domain(&self, ctx: &Context<'_>, id: i32) -> Result<Option<YourDomain>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let item = app_ctx.your_domain_repository.find_by_id(id).await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(item.map(YourDomain::from))
    }
}
```

### 7. Create GraphQL Mutations

`src/domains/your_domain/mutations.rs`:

```rust
use async_graphql::*;
use std::sync::Arc;
use crate::infrastructure::AppContext;
use super::{types::{YourDomain, CreateYourDomainInput}, YourDomainRepository};

#[derive(Default)]
pub struct YourDomainMutations;

#[Object]
impl YourDomainMutations {
    async fn create_your_domain(&self, ctx: &Context<'_>, input: CreateYourDomainInput) -> Result<YourDomain> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let item = app_ctx.your_domain_repository.create(input.name).await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(YourDomain::from(item))
    }
}
```

### 8. Create Module File

`src/domains/your_domain/mod.rs`:

```rust
pub mod entity;
pub mod mutations;
pub mod queries;
pub mod repository;
pub mod types;

pub use mutations::YourDomainMutations;
pub use queries::YourDomainQueries;
pub use repository::YourDomainRepository;
pub use types::*;
```

### 9. Register in Domains

`src/domains/mod.rs`:

```rust
pub mod tasks;
pub mod your_domain;
```

### 10. Add to AppContext

`src/infrastructure/context.rs`:

```rust
use crate::domains::{tasks::TaskRepository, your_domain::YourDomainRepository};

pub struct AppContext {
    pub task_repository: TaskRepository,
    pub your_domain_repository: YourDomainRepository,
}

impl AppContext {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            task_repository: TaskRepository::new(db.clone()),
            your_domain_repository: YourDomainRepository::new(db),
        }
    }
}
```

### 11. Merge into GraphQL Schema

`src/api/graphql/schema.rs`:

```rust
use crate::domains::{
    tasks::{TaskQueries, TaskMutations},
    your_domain::{YourDomainQueries, YourDomainMutations},
};

#[derive(MergedObject, Default)]
pub struct QueryRoot(TaskQueries, YourDomainQueries);

#[derive(MergedObject, Default)]
pub struct MutationRoot(TaskMutations, YourDomainMutations);
```

## Testing

Create tests following the same structure:
```
tests/domains/your_domain/
├── unit/
│   ├── mod.rs
│   ├── repository_unit_test.rs
│   └── queries_unit_test.rs
├── integration/
│   ├── mod.rs
│   └── database_integration_test.rs
└── system/
    ├── mod.rs
    └── graphql_system_test.rs
```

## Checklist

- Database migration
- Domain entity (SeaORM model)
- Repository with CRUD operations
- GraphQL types (output and input)
- GraphQL queries
- GraphQL mutations
- Module exports
- Add to AppContext
- Merge into GraphQL schema
- Unit tests
- Integration tests
