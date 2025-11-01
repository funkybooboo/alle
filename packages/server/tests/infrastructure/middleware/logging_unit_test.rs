use alle_server::infrastructure::middleware::logging::RequestLogger;
use hyper::{Body, Request};
use std::time::Duration;

#[test]
fn test_request_logger_log_request() {
    let request = Request::builder()
        .method("GET")
        .uri("/graphql")
        .body(Body::empty())
        .unwrap();

    let start = RequestLogger::log_request(&request);

    // Verify instant was created
    assert!(start.elapsed() < Duration::from_secs(1));
}

#[test]
fn test_request_logger_log_request_with_query() {
    let request = Request::builder()
        .method("POST")
        .uri("/graphql?debug=true")
        .body(Body::empty())
        .unwrap();

    let start = RequestLogger::log_request(&request);

    assert!(start.elapsed() < Duration::from_secs(1));
}

#[test]
fn test_request_logger_log_response() {
    use std::time::Instant;

    let start = Instant::now();
    std::thread::sleep(Duration::from_millis(10));

    RequestLogger::log_response(start, 200);

    // Should not panic
    assert!(start.elapsed() >= Duration::from_millis(10));
}

#[test]
fn test_request_logger_various_status_codes() {
    use std::time::Instant;

    let start = Instant::now();

    RequestLogger::log_response(start, 200);
    RequestLogger::log_response(start, 404);
    RequestLogger::log_response(start, 500);

    // Should handle all status codes without panic
    assert!(start.elapsed() < Duration::from_secs(1));
}
