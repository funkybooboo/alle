use alle_server::{graphql, infrastructure, AppContext};
use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Method, Request, Response, Server, StatusCode};
use sea_orm_migration::MigratorTrait;
use std::net::SocketAddr;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Load application configuration
    let config = infrastructure::AppConfig::load()
        .map_err(|e| format!("Failed to load configuration: {}", e))?;

    // Database setup
    println!("Connecting to database: {}", config.database.url());
    let db =
        infrastructure::database::connection::establish_connection(config.database.url()).await?;

    // Run migrations
    println!("Running migrations...");
    infrastructure::Migrator::up(&db, None).await?;
    println!("Migrations completed successfully");

    // Initialize application context with dependency injection
    let app_context = Arc::new(AppContext::new(db));

    // Create GraphQL schema
    let graphql_schema = graphql::create_schema(Arc::clone(&app_context));

    // Start HTTP server
    let addr: SocketAddr = config.server.address().parse()?;
    let make_svc = make_service_fn(move |_conn| {
        let schema = graphql_schema.clone();
        async move { Ok::<_, hyper::Error>(service_fn(move |req| route_request(req, schema.clone()))) }
    });
    let server = Server::bind(&addr).serve(make_svc);

    println!("Server starting...");
    println!("Environment: {:?}", config.server.environment);
    println!("Log level: {}", config.server.log_level);
    println!("Server listening on http://{}", addr);
    println!("GraphQL playground: http://{}/graphql", addr);

    server.await?;
    Ok(())
}

async fn route_request(
    req: Request<Body>,
    schema: graphql::AppSchema,
) -> Result<Response<Body>, hyper::Error> {
    let path = req.uri().path();

    // Handle CORS preflight requests
    if req.method() == Method::OPTIONS {
        return Ok(Response::builder()
            .status(StatusCode::OK)
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            .header("Access-Control-Allow-Headers", "Content-Type")
            .body(Body::empty())
            .unwrap());
    }

    match (req.method(), path) {
        (&Method::POST, "/graphql") => handle_graphql(req, schema).await,
        (&Method::GET, "/graphql") => {
            // GraphQL Playground
            let html = playground_source(GraphQLPlaygroundConfig::new("/graphql"));
            Ok(Response::builder()
                .header("content-type", "text/html")
                .header("Access-Control-Allow-Origin", "*")
                .body(Body::from(html))
                .unwrap())
        }
        _ => {
            let response = Response::builder()
                .status(404)
                .header("Access-Control-Allow-Origin", "*")
                .body(Body::from("Not Found - Use /graphql endpoint"))
                .unwrap();
            Ok(response)
        }
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
                .expect("Failed to build error response"));
        }
    };

    let graphql_response = schema.execute(graphql_request).await;
    let json = match serde_json::to_string(&graphql_response) {
        Ok(s) => s,
        Err(e) => {
            return Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from(format!("Failed to serialize response: {}", e)))
                .expect("Failed to build error response"));
        }
    };

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("content-type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .body(Body::from(json))
        .expect("Failed to build response"))
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn simple_async_test() {
        let result = async { 2 + 2 }.await;
        assert_eq!(result, 4);
    }
}
