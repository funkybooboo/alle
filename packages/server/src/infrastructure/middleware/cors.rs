use hyper::{header::HeaderValue, Body, Request, Response, StatusCode};

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

        // Only insert headers if they can be parsed successfully
        if let Ok(value) = self.allowed_origins.join(", ").parse::<HeaderValue>() {
            headers.insert("Access-Control-Allow-Origin", value);
        }

        if let Ok(value) = self.allowed_methods.join(", ").parse::<HeaderValue>() {
            headers.insert("Access-Control-Allow-Methods", value);
        }

        if let Ok(value) = self.allowed_headers.join(", ").parse::<HeaderValue>() {
            headers.insert("Access-Control-Allow-Headers", value);
        }

        if let Ok(value) = self.max_age.to_string().parse::<HeaderValue>() {
            headers.insert("Access-Control-Max-Age", value);
        }

        response
    }

    /// Handle preflight OPTIONS request
    pub fn handle_preflight(&self) -> Response<Body> {
        let response = Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body(Body::empty())
            .unwrap();

        self.apply_headers(response)
    }

    /// Check if request needs preflight handling
    pub fn is_preflight(req: &Request<Body>) -> bool {
        req.method() == hyper::Method::OPTIONS
    }
}
