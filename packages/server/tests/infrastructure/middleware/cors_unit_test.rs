use alle_server::infrastructure::middleware::cors::CorsConfig;
use hyper::{Body, Request, Response, StatusCode};

#[test]
fn test_cors_config_default() {
    let config = CorsConfig::default();

    assert_eq!(config.allowed_origins, vec!["*"]);
    assert!(config.allowed_methods.contains(&"GET".to_string()));
    assert!(config.allowed_methods.contains(&"POST".to_string()));
    assert!(config.allowed_methods.contains(&"OPTIONS".to_string()));
    assert!(config.allowed_headers.contains(&"Content-Type".to_string()));
    assert!(config
        .allowed_headers
        .contains(&"Authorization".to_string()));
    assert_eq!(config.max_age, 86400);
}

#[test]
fn test_cors_apply_headers() {
    let config = CorsConfig::default();
    let response = Response::new(Body::empty());

    let response_with_cors = config
        .apply_headers(response)
        .expect("Failed to apply CORS headers");

    let headers = response_with_cors.headers();
    assert!(headers.contains_key("access-control-allow-origin"));
    assert!(headers.contains_key("access-control-allow-methods"));
    assert!(headers.contains_key("access-control-allow-headers"));
    assert!(headers.contains_key("access-control-max-age"));
}

#[test]
fn test_cors_handle_preflight() {
    let config = CorsConfig::default();
    let response = config
        .handle_preflight()
        .expect("Failed to handle preflight request");

    assert_eq!(response.status(), StatusCode::NO_CONTENT);

    let headers = response.headers();
    assert!(headers.contains_key("access-control-allow-origin"));
    assert!(headers.contains_key("access-control-allow-methods"));
}

#[test]
fn test_cors_is_preflight() {
    let request = Request::builder()
        .method("OPTIONS")
        .body(Body::empty())
        .unwrap();

    assert!(CorsConfig::is_preflight(&request));

    let request = Request::builder()
        .method("GET")
        .body(Body::empty())
        .unwrap();

    assert!(!CorsConfig::is_preflight(&request));
}

#[test]
fn test_cors_custom_config() {
    let config = CorsConfig {
        allowed_origins: vec!["http://localhost:3000".to_string()],
        allowed_methods: vec!["GET".to_string(), "POST".to_string()],
        allowed_headers: vec!["Content-Type".to_string()],
        max_age: 3600,
    };

    assert_eq!(config.allowed_origins.len(), 1);
    assert_eq!(config.max_age, 3600);
}

#[test]
fn test_cors_apply_headers_with_invalid_values() {
    // Test with invalid header values (newlines are not allowed in HTTP headers)
    let config = CorsConfig {
        allowed_origins: vec!["http://example.com\nmalicious".to_string()],
        allowed_methods: vec!["GET".to_string()],
        allowed_headers: vec!["Content-Type".to_string()],
        max_age: 3600,
    };

    let response = Response::new(Body::empty());
    let result = config.apply_headers(response);

    assert!(result.is_err(), "Expected error for invalid header value");
    assert!(result
        .unwrap_err()
        .contains("Invalid CORS origin header value"));
}
