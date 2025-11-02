use hyper::header::HeaderValue;
use hyper::{Body, Request, Response, StatusCode};

/// CORS middleware configuration
pub struct CorsConfig {
    pub allowed_origins: Vec<String>,
    pub allowed_methods: Vec<String>,
    pub allowed_headers: Vec<String>,
    pub max_age: u32,
}

impl Default for CorsConfig {
    fn default() -> Self {
        Self {
            allowed_origins: vec!["*".to_string()],
            allowed_methods: vec!["GET".to_string(), "POST".to_string(), "OPTIONS".to_string()],
            allowed_headers: vec!["Content-Type".to_string(), "Authorization".to_string()],
            max_age: 86400, // 24 hours
        }
    }
}

impl CorsConfig {
    /// Apply CORS headers to a response
    pub fn apply_headers(&self, mut response: Response<Body>) -> Response<Body> {
        let headers = response.headers_mut();

        // Parse and insert allowed origins, using a fallback if parsing fails
        if let Ok(value) = HeaderValue::from_str(&self.allowed_origins.join(", ")) {
            headers.insert("Access-Control-Allow-Origin", value);
        } else {
            eprintln!("Warning: Failed to parse allowed_origins, using fallback '*'");
            headers.insert("Access-Control-Allow-Origin", HeaderValue::from_static("*"));
        }

        // Parse and insert allowed methods, using a fallback if parsing fails
        if let Ok(value) = HeaderValue::from_str(&self.allowed_methods.join(", ")) {
            headers.insert("Access-Control-Allow-Methods", value);
        } else {
            eprintln!(
                "Warning: Failed to parse allowed_methods, using fallback 'GET, POST, OPTIONS'"
            );
            headers.insert(
                "Access-Control-Allow-Methods",
                HeaderValue::from_static("GET, POST, OPTIONS"),
            );
        }

        // Parse and insert allowed headers, using a fallback if parsing fails
        if let Ok(value) = HeaderValue::from_str(&self.allowed_headers.join(", ")) {
            headers.insert("Access-Control-Allow-Headers", value);
        } else {
            eprintln!("Warning: Failed to parse allowed_headers, using fallback 'Content-Type'");
            headers.insert(
                "Access-Control-Allow-Headers",
                HeaderValue::from_static("Content-Type"),
            );
        }

        // Parse and insert max age, using a fallback if parsing fails
        if let Ok(value) = HeaderValue::from_str(&self.max_age.to_string()) {
            headers.insert("Access-Control-Max-Age", value);
        } else {
            eprintln!("Warning: Failed to parse max_age, using fallback '86400'");
            headers.insert("Access-Control-Max-Age", HeaderValue::from_static("86400"));
        }

        response
    }

    /// Handle preflight OPTIONS request
    pub fn handle_preflight(&self) -> Response<Body> {
        // Build the response, using a fallback if builder fails
        let response = Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body(Body::empty())
            .unwrap_or_else(|e| {
                eprintln!(
                    "Warning: Failed to build preflight response: {}, using default",
                    e
                );
                Response::new(Body::empty())
            });

        self.apply_headers(response)
    }

    /// Check if request needs preflight handling
    pub fn is_preflight(req: &Request<Body>) -> bool {
        req.method() == hyper::Method::OPTIONS
    }
}
