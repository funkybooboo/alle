# Adding New Entities

Guide for adding a new entity with full REST and GraphQL support.

## Pattern

Each entity follows the same structure:
1. Database entity (SeaORM)
2. Repository for data access
3. GraphQL types and queries/mutations
4. REST handlers (optional)

## Steps

### 1. Create Database Migration

`src/migration/m20250101_000002_create_your_entity.rs`:

```rust
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.create_table(
            Table::create()
                .table(YourEntity::Table)
                .if_not_exists()
                .col(ColumnDef::new(YourEntity::Id).integer().not_null().auto_increment().primary_key())
                .col(ColumnDef::new(YourEntity::Name).string().not_null())
                .to_owned(),
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(YourEntity::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
enum YourEntity {
    Table,
    Id,
    Name,
}
```

Add to `src/migration/mod.rs`:
```rust
vec![
    Box::new(m20250101_000001_create_tasks::Migration),
    Box::new(m20250101_000002_create_your_entity::Migration),
]
```

Generate entity:
```bash
sea-orm-cli generate entity -o src/entities
```

### 2. Create Repository

`src/repositories/your_entity_repository.rs`:

```rust
use sea_orm::*;
use crate::entities::your_entity;

pub struct YourEntityRepository {
    db: DatabaseConnection,
}

impl YourEntityRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    fn db(&self) -> &DatabaseConnection {
        &self.db
    }

    pub async fn create(&self, name: String) -> Result<your_entity::Model, DbErr> {
        let new_entity = your_entity::ActiveModel {
            name: Set(name),
            ..Default::default()
        };
        new_entity.insert(self.db()).await
    }

    pub async fn find_all(&self) -> Result<Vec<your_entity::Model>, DbErr> {
        your_entity::Entity::find().all(self.db()).await
    }
}
```

Update `src/repositories/mod.rs`:
```rust
mod your_entity_repository;
pub use your_entity_repository::YourEntityRepository;
```

### 3. Add to AppContext

`src/app_context.rs`:

```rust
pub struct AppContext {
    pub task_repository: Arc<TaskRepository>,
    pub your_entity_repository: Arc<YourEntityRepository>,
}

impl AppContext {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            task_repository: Arc::new(TaskRepository::new(db.clone())),
            your_entity_repository: Arc::new(YourEntityRepository::new(db)),
        }
    }
}

impl Clone for AppContext {
    fn clone(&self) -> Self {
        Self {
            task_repository: Arc::clone(&self.task_repository),
            your_entity_repository: Arc::clone(&self.your_entity_repository),
        }
    }
}
```

### 4. Create GraphQL Types

`src/graphql/your_entity_types.rs`:

```rust
use async_graphql::*;

#[derive(SimpleObject, Clone)]
pub struct YourEntity {
    pub id: i32,
    pub name: String,
}

impl From<crate::entities::your_entity::Model> for YourEntity {
    fn from(model: crate::entities::your_entity::Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
        }
    }
}

#[derive(InputObject)]
pub struct CreateYourEntityInput {
    pub name: String,
}
```

### 5. Create GraphQL Queries/Mutations

`src/graphql/your_entity_queries.rs`:

```rust
use async_graphql::*;
use std::sync::Arc;
use crate::AppContext;
use super::your_entity_types::{YourEntity, CreateYourEntityInput};

#[derive(Default)]
pub struct YourEntityQueries;

#[Object]
impl YourEntityQueries {
    async fn your_entities(&self, ctx: &Context<'_>) -> Result<Vec<YourEntity>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let entities = app_ctx.your_entity_repository.find_all().await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(entities.into_iter().map(YourEntity::from).collect())
    }
}

#[derive(Default)]
pub struct YourEntityMutations;

#[Object]
impl YourEntityMutations {
    async fn create_your_entity(&self, ctx: &Context<'_>, input: CreateYourEntityInput) -> Result<YourEntity> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;
        let entity = app_ctx.your_entity_repository.create(input.name).await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;
        Ok(YourEntity::from(entity))
    }
}
```

Update `src/graphql/mod.rs`:
```rust
pub mod your_entity_types;
pub mod your_entity_queries;
```

### 6. Merge into GraphQL Schema

`src/graphql/schema.rs`:

```rust
use super::your_entity_queries::{YourEntityQueries, YourEntityMutations};

#[derive(MergedObject, Default)]
pub struct QueryRoot(TaskQueries, YourEntityQueries);

#[derive(MergedObject, Default)]
pub struct MutationRoot(TaskMutations, YourEntityMutations);
```

### 7. Optional: Add REST Handlers

Follow the same pattern as `src/handlers/task_handlers.rs`.

## Checklist

- Database migration
- SeaORM entity (auto-generated)
- Repository with database connection
- Add to `AppContext`
- GraphQL types
- GraphQL queries/mutations
- Merge into schema
- REST handlers (optional)
- OpenAPI annotations (optional)
