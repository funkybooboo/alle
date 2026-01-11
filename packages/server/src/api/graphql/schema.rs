use crate::domains::settings::{SettingsMutations, SettingsQueries};
use crate::domains::someday::{
    SomedayListsMutations, SomedayListsQueries, SomedayTasksMutations, SomedayTasksQueries,
};
use crate::domains::tasks::{TaskMutations, TaskQueries};
use crate::domains::trash::{TrashMutations, TrashQueries};
use crate::infrastructure::context::AppContext;
use async_graphql::{MergedObject, Schema, Subscription};
use futures_util::Stream;
use std::sync::Arc;
use std::time::Duration;
use tokio_stream::StreamExt;

pub type AppSchema = Schema<QueryRoot, MutationRoot, SubscriptionRoot>;

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

#[derive(Default)]
pub struct SubscriptionRoot;

#[Subscription]
impl SubscriptionRoot {
    async fn system_notification(&self) -> impl Stream<Item = String> {
        tokio_stream::wrappers::IntervalStream::new(tokio::time::interval(Duration::from_secs(30)))
            .map(|_| "System check: Connection active".to_string())
    }
}

/// Create the GraphQL schema with the given AppContext
pub fn create_schema(ctx: Arc<AppContext>) -> AppSchema {
    Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        SubscriptionRoot::default(),
    )
    .data(ctx)
    .finish()
}
