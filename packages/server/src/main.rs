use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server, StatusCode};
use std::convert::Infallible;
use std::net::SocketAddr;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    let make_svc = make_service_fn(|_conn| async { Ok::<_, Infallible>(service_fn(hello_world)) });
    let server = Server::bind(&addr).serve(make_svc);
    println!("Server listening on http://{}", addr);
    server.await?;
    Ok(())
}

async fn hello_world(_req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let mut response = Response::new(Body::empty());
    *response.status_mut() = StatusCode::OK;
    *response.body_mut() = Body::from("Hello, World!");
    Ok(response)
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
