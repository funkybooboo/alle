use crate::domains::settings::{SettingsMutations, SettingsQueries};
use crate::domains::someday::{
    SomedayListsMutations, SomedayListsQueries, SomedayTasksMutations, SomedayTasksQueries,
};
use crate::domains::tasks::{TaskMutations, TaskQueries};
use crate::domains::trash::{TrashMutations, TrashQueries};
use crate::infrastructure::context::AppContext;
use async_graphql::{EmptySubscription, MergedObject, Schema};
use std::sync::Arc;

pub type AppSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

/// Root query combining all entity queries
///
/// To add a new entity:
/// 1. Create a new domain with queries.rs
/// 2. Add it to the MergedObject derive below
/// 3. Import and add the field to QueryRoot struct
#[derive(MergedObject, Default)]
pub struct QueryRoot(
    TaskQueries,
    SettingsQueries,
    SomedayListsQueries,
    SomedayTasksQueries,
    TrashQueries,
);

/// Root mutation combining all entity mutations
///
/// To add a new entity:
/// 1. Create a new domain with mutations.rs
/// 2. Add it to the MergedObject derive below
/// 3. Import and add the field to MutationRoot struct
#[derive(MergedObject, Default)]
pub struct MutationRoot(
    TaskMutations,
    SettingsMutations,
    SomedayListsMutations,
    SomedayTasksMutations,
    TrashMutations,
);

/// Create the GraphQL schema with the given AppContext
pub fn create_schema(ctx: Arc<AppContext>) -> AppSchema {
    Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        EmptySubscription,
    )
    .data(ctx)
    .finish()
}
