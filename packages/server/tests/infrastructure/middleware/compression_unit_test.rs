use alle_server::infrastructure::middleware::compression::CompressionMiddleware;
use hyper::{Body, Request, Response};

#[test]
fn test_compression_accepts_gzip() {
    let request_with_gzip = Request::builder()
        .header("accept-encoding", "gzip, deflate")
        .body(Body::empty())
        .unwrap();

    assert!(CompressionMiddleware::accepts_gzip(&request_with_gzip));

    let request_without_gzip = Request::builder()
        .header("accept-encoding", "deflate")
        .body(Body::empty())
        .unwrap();

    assert!(!CompressionMiddleware::accepts_gzip(&request_without_gzip));
}

#[test]
fn test_compression_no_accept_encoding() {
    let request = Request::builder().body(Body::empty()).unwrap();

    assert!(!CompressionMiddleware::accepts_gzip(&request));
}

#[test]
fn test_compression_add_headers() {
    let response = Response::new(Body::empty());
    let response_with_headers = CompressionMiddleware::add_compression_headers(response);

    let headers = response_with_headers.headers();
    assert!(headers.contains_key("vary"));
    assert_eq!(headers.get("vary").unwrap(), "Accept-Encoding");
}
