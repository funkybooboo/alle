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
    pub fn apply_headers(&self, mut response: Response<Body>) -> Result<Response<Body>, String> {
        let headers = response.headers_mut();

        let origin_value = HeaderValue::from_str(&self.allowed_origins.join(", "))
            .map_err(|e| format!("Invalid CORS origin header value: {}", e))?;
        headers.insert("Access-Control-Allow-Origin", origin_value);

        let methods_value = HeaderValue::from_str(&self.allowed_methods.join(", "))
            .map_err(|e| format!("Invalid CORS methods header value: {}", e))?;
        headers.insert("Access-Control-Allow-Methods", methods_value);

        let headers_value = HeaderValue::from_str(&self.allowed_headers.join(", "))
            .map_err(|e| format!("Invalid CORS headers header value: {}", e))?;
        headers.insert("Access-Control-Allow-Headers", headers_value);

        let max_age_value = HeaderValue::from_str(&self.max_age.to_string())
            .map_err(|e| format!("Invalid CORS max-age header value: {}", e))?;
        headers.insert("Access-Control-Max-Age", max_age_value);

        Ok(response)
    }

    /// Handle preflight OPTIONS request
    pub fn handle_preflight(&self) -> Result<Response<Body>, String> {
        let response = Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body(Body::empty())
            .map_err(|e| format!("Failed to build preflight response: {}", e))?;

        self.apply_headers(response)
    }

    /// Check if request needs preflight handling
    pub fn is_preflight(req: &Request<Body>) -> bool {
        req.method() == hyper::Method::OPTIONS
    }
}
