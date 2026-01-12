use alle_server::{api, graphql, infrastructure, AppContext};
use async_graphql::http::{playground_source, ALL_WEBSOCKET_PROTOCOLS, GraphQLPlaygroundConfig};
use async_graphql_axum::{GraphQLProtocol, GraphQLRequest, GraphQLResponse, GraphQLWebSocket};
use axum::{
    extract::{ws::WebSocketUpgrade, Extension},
    response::{Html, IntoResponse},
    routing::{get, post},
    Router,
};
use sea_orm_migration::MigratorTrait;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Load application configuration
    let config = infrastructure::AppConfig::load()
        .map_err(|e| format!("Failed to load configuration: {}", e))?;

    // Database setup
    println!(
        "Connecting to database: {}",
        config.database.sanitized_url()
    );
    let db =
        infrastructure::database::connection::establish_connection(config.database.url()).await?;

    // Run migrations
    println!("Running migrations...");
    infrastructure::Migrator::up(&db, None).await?;
    println!("Migrations completed successfully");

    // Initialize MinIO client
    println!("Initializing MinIO client...");
    let minio_client = infrastructure::storage::minio_client::MinioClient::new(config.minio)
        .await
        .map_err(|e| format!("Failed to initialize MinIO client: {}", e))?;
    println!("MinIO client initialized successfully");

    // Initialize application context with dependency injection
    let app_context = Arc::new(AppContext::new(db, minio_client));

    // Create GraphQL schema
    let schema = graphql::create_schema(Arc::clone(&app_context));

    // Create upload state for REST endpoints
    let upload_state = Arc::new(api::rest::UploadState {
        minio_client: Arc::clone(&app_context.minio_client),
        attachment_repository: Arc::clone(&app_context.task_attachments_repository),
    });

    // Setup CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the router
    let app = Router::new()
        .route("/graphql", get(graphql_playground).post(graphql_handler))
        .route("/ws", get(graphql_subscription))
        .route("/api/upload", post(api::rest::upload_file))
        .layer(Extension(schema))
        .with_state(upload_state)
        .layer(cors);

    // Start HTTP server
    let addr: SocketAddr = config.server.address().parse().map_err(|e| {
        format!(
            "Invalid server address format '{}': {}",
            config.server.address(),
            e
        )
    })?;

    println!("Server starting...");
    println!("Environment: {:?}", config.server.environment);
    println!("Log level: {}", config.server.log_level);
    println!("Server listening on http://{}", addr);
    println!("GraphQL playground: http://{}/graphql", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn graphql_playground() -> impl IntoResponse {
    Html(playground_source(
        GraphQLPlaygroundConfig::new("/graphql").subscription_endpoint("/ws"),
    ))
}

async fn graphql_handler(
    schema: Extension<graphql::AppSchema>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}

async fn graphql_subscription(
    schema: Extension<graphql::AppSchema>,
    protocol: GraphQLProtocol,
    upgrade: WebSocketUpgrade,
) -> impl IntoResponse {
    upgrade
        .protocols(ALL_WEBSOCKET_PROTOCOLS)
        .on_upgrade(move |stream| {
            GraphQLWebSocket::new(stream, schema.0, protocol)
                .serve()
        })
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn simple_async_test() {
        let result = async { 2 + 2 }.await;
        assert_eq!(result, 4);
    }
}