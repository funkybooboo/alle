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

    let response_with_cors = config.apply_headers(response);

    let headers = response_with_cors.headers();
    assert!(headers.contains_key("access-control-allow-origin"));
    assert!(headers.contains_key("access-control-allow-methods"));
    assert!(headers.contains_key("access-control-allow-headers"));
    assert!(headers.contains_key("access-control-max-age"));
}

#[test]
fn test_cors_handle_preflight() {
    let config = CorsConfig::default();
    let response = config.handle_preflight();

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
fn test_cors_handles_invalid_header_values() {
    // Test with header values containing invalid characters (newlines, control chars)
    let config = CorsConfig {
        allowed_origins: vec!["http://example.com\n".to_string()], // Invalid: contains newline
        allowed_methods: vec!["GET".to_string()],
        allowed_headers: vec!["X-Invalid\r\nHeader".to_string()], // Invalid: contains CRLF
        max_age: 3600,
    };

    let response = Response::new(Body::empty());
    let response_with_cors = config.apply_headers(response);

    // Should still have CORS headers with fallback values
    let headers = response_with_cors.headers();
    assert!(headers.contains_key("access-control-allow-origin"));
    assert!(headers.contains_key("access-control-allow-methods"));
    assert!(headers.contains_key("access-control-allow-headers"));
    assert!(headers.contains_key("access-control-max-age"));

    // Fallback origin should be "*"
    let origin = headers.get("access-control-allow-origin").unwrap();
    assert_eq!(origin, "*");

    // Fallback headers should be "Content-Type"
    let allowed_headers = headers.get("access-control-allow-headers").unwrap();
    assert_eq!(allowed_headers, "Content-Type");
}

#[test]
fn test_cors_handles_invalid_methods() {
    // Test with invalid method values
    let config = CorsConfig {
        allowed_origins: vec!["*".to_string()],
        allowed_methods: vec!["GET\nPOST".to_string()], // Invalid: contains newline
        allowed_headers: vec!["Content-Type".to_string()],
        max_age: 3600,
    };

    let response = Response::new(Body::empty());
    let response_with_cors = config.apply_headers(response);

    let headers = response_with_cors.headers();
    assert!(headers.contains_key("access-control-allow-methods"));

    // Fallback methods should be "GET, POST, OPTIONS"
    let methods = headers.get("access-control-allow-methods").unwrap();
    assert_eq!(methods, "GET, POST, OPTIONS");
}
