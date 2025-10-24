use alle_server::{AppContext, db, graphql, handlers, migration};
use async_graphql::http::{GraphQLPlaygroundConfig, playground_source};
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Method, Request, Response, Server, StatusCode};
use sea_orm_migration::prelude::*;
use std::net::SocketAddr;
use std::sync::Arc;
use utoipa::OpenApi;
use utoipa_swagger_ui::Config as SwaggerConfig;

#[derive(OpenApi)]
#[openapi(
    paths(),
    components(
        schemas(
            handlers::CreateTaskRequest,
            handlers::UpdateTaskRequest,
            handlers::TaskResponse,
            handlers::ErrorResponse,
        )
    ),
    tags(
        (name = "tasks", description = "Task management endpoints")
    ),
    info(
        title = "Alle Task Management API",
        version = "1.0.0",
        description = "REST API for Alle, a minimalist to-do list and planning application",
        license(
            name = "GPL-3.0-or-later"
        )
    ),
    servers(
        (url = "http://localhost:8000", description = "Local development server")
    )
)]
struct ApiDoc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Load environment variables from .env file
    dotenvy::dotenv().ok();

    // Database setup
    let database_url = std::env::var("ALLE_SERVER_DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:./alle.db?mode=rwc".to_string());

    println!("Connecting to database: {}", database_url);
    let db = db::establish_connection(&database_url).await?;

    // Run migrations
    println!("Running migrations...");
    migration::Migrator::up(&db, None).await?;
    println!("Migrations completed successfully");

    // Initialize application context with dependency injection
    let app_context = Arc::new(AppContext::new(db));

    // Create GraphQL schema
    let graphql_schema = graphql::create_schema(Arc::clone(&app_context));

    // Start HTTP server
    let host = std::env::var("ALLE_SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = std::env::var("ALLE_SERVER_PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse::<u16>()
        .unwrap_or(8000);

    let addr: SocketAddr = format!("{}:{}", host, port).parse()?;
    let make_svc = make_service_fn(move |_conn| {
        let ctx = Arc::clone(&app_context);
        let schema = graphql_schema.clone();
        async move {
            Ok::<_, hyper::Error>(service_fn(move |req| {
                route_request(req, Arc::clone(&ctx), schema.clone())
            }))
        }
    });
    let server = Server::bind(&addr).serve(make_svc);
    let env = std::env::var("ALLE_SERVER_ENV").unwrap_or_else(|_| "development".to_string());

    println!("Server starting...");
    println!("Environment: {}", env);
    println!("Server listening on http://{}", addr);
    println!("GraphQL playground: http://{}:{}/graphql", host, port);
    println!("Swagger UI: http://{}:{}/swagger-ui/", host, port);
    println!(
        "OpenAPI spec: http://{}:{}/api-docs/openapi.json",
        host, port
    );
    server.await?;
    Ok(())
}

async fn route_request(
    req: Request<Body>,
    ctx: Arc<AppContext>,
    schema: graphql::AppSchema,
) -> Result<Response<Body>, hyper::Error> {
    let path = req.uri().path();
    let query = req.uri().query();

    match (req.method(), path) {
        (&Method::POST, "/graphql") => handle_graphql(req, schema).await,
        (&Method::GET, "/graphql") => {
            // GraphQL Playground
            let html = playground_source(GraphQLPlaygroundConfig::new("/graphql"));
            Ok(Response::builder()
                .header("content-type", "text/html")
                .body(Body::from(html))
                .unwrap())
        }
        (&Method::GET, "/api-docs/openapi.json") => {
            // Serve OpenAPI JSON spec
            let openapi = ApiDoc::openapi().to_json().unwrap();
            Ok(Response::builder()
                .status(StatusCode::OK)
                .header("content-type", "application/json")
                .body(Body::from(openapi))
                .unwrap())
        }
        (&Method::GET, path) if path.starts_with("/swagger-ui") => {
            // Serve Swagger UI
            serve_swagger_ui(path, query).await
        }
        _ if path.starts_with("/api/tasks") => handlers::handle_tasks(req, ctx).await,
        _ => {
            let response = Response::builder()
                .status(404)
                .body(Body::from("Not Found"))
                .unwrap();
            Ok(response)
        }
    }
}

async fn serve_swagger_ui(
    path: &str,
    _query: Option<&str>,
) -> Result<Response<Body>, hyper::Error> {
    let config = Arc::new(SwaggerConfig::new(["/api-docs/openapi.json"]));

    // Redirect /swagger-ui to /swagger-ui/
    if path == "/swagger-ui" {
        return Ok(Response::builder()
            .status(StatusCode::MOVED_PERMANENTLY)
            .header("location", "/swagger-ui/")
            .body(Body::empty())
            .unwrap());
    }

    // Serve the Swagger UI
    let swagger_html = utoipa_swagger_ui::serve(path, config).unwrap_or(None);

    match swagger_html {
        Some(file) => {
            let content_type = match file.content_type.as_str() {
                "text/html" => "text/html; charset=utf-8",
                "application/javascript" => "application/javascript",
                "text/css" => "text/css",
                ct => ct,
            };

            Ok(Response::builder()
                .status(StatusCode::OK)
                .header("content-type", content_type)
                .body(Body::from(file.bytes.to_vec()))
                .unwrap())
        }
        None => Ok(Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Body::from("Not Found"))
            .unwrap()),
    }
}

async fn handle_graphql(
    req: Request<Body>,
    schema: graphql::AppSchema,
) -> Result<Response<Body>, hyper::Error> {
    let body_bytes = hyper::body::to_bytes(req.into_body()).await?;
    let graphql_request: async_graphql::Request = match serde_json::from_slice(&body_bytes) {
        Ok(req) => req,
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .body(Body::from(format!("Invalid GraphQL request: {}", e)))
                .unwrap());
        }
    };

    let graphql_response = schema.execute(graphql_request).await;
    let json = serde_json::to_string(&graphql_response).unwrap();

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("content-type", "application/json")
        .body(Body::from(json))
        .unwrap())
}

#[cfg(test)]
mod tests {
    // A simple async test using Tokio runtime
    #[tokio::test]
    async fn simple_async_test() {
        let result = async { 2 + 2 }.await;
        assert_eq!(result, 4);
    }
}
