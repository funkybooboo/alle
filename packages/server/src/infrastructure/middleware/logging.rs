use hyper::{Body, Request};
use std::time::Instant;

/// Request logging middleware
pub struct RequestLogger;

impl RequestLogger {
    /// Log request start
    pub fn log_request(req: &Request<Body>) -> Instant {
        let method = req.method();
        let path = req.uri().path();
        let query = req.uri().query().unwrap_or("");

        println!(
            "[REQUEST] {} {} {}",
            method,
            path,
            if query.is_empty() {
                String::new()
            } else {
                format!("?{}", query)
            }
        );

        Instant::now()
    }

    /// Log request completion
    pub fn log_response(start: Instant, status: u16) {
        let duration = start.elapsed();
        println!("[RESPONSE] {} - {}ms", status, duration.as_millis());
    }
}
