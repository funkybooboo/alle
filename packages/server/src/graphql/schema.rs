use super::task_queries::{TaskMutations, TaskQueries};
use crate::AppContext;
use async_graphql::*;
use std::sync::Arc;

pub type AppSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

/// Root query combining all entity queries
///
/// To add a new entity:
/// 1. Create a new file like `your_entity_queries.rs` with YourEntityQueries struct
/// 2. Add it to the MergedObject derive below
/// 3. Add the field to QueryRoot struct
#[derive(MergedObject, Default)]
pub struct QueryRoot(TaskQueries);

/// Root mutation combining all entity mutations
///
/// To add a new entity:
/// 1. Create a new file like `your_entity_queries.rs` with YourEntityMutations struct
/// 2. Add it to the MergedObject derive below
/// 3. Add the field to MutationRoot struct
#[derive(MergedObject, Default)]
pub struct MutationRoot(TaskMutations);

pub fn create_schema(app_ctx: Arc<AppContext>) -> AppSchema {
    Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        EmptySubscription,
    )
    .data(app_ctx)
    .finish()
}
