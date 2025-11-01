use std::env;

/// CORS configuration
#[derive(Debug, Clone)]
pub struct CorsConfig {
    pub allowed_origins: Vec<String>,
}

impl CorsConfig {
    /// Load CORS configuration from environment
    pub fn from_env() -> Result<Self, String> {
        let origins = env::var("ALLE_SERVER_CORS_ORIGINS")
            .unwrap_or_else(|_| "http://localhost:3000,http://localhost:5173".to_string());

        let allowed_origins = origins
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        Ok(Self { allowed_origins })
    }

    /// Check if origin is allowed
    pub fn is_allowed(&self, origin: &str) -> bool {
        self.allowed_origins.iter().any(|o| o == origin)
    }
}

#[cfg(test)]
mod tests {
    use super::CorsConfig;

    #[test]
    fn test_default_cors_config() {
        let config = CorsConfig::from_env().unwrap();
        assert!(config
            .allowed_origins
            .contains(&"http://localhost:3000".to_string()));
        assert!(config
            .allowed_origins
            .contains(&"http://localhost:5173".to_string()));
    }

    #[test]
    fn test_is_allowed() {
        let config = CorsConfig::from_env().unwrap();
        assert!(config.is_allowed("http://localhost:3000"));
        assert!(config.is_allowed("http://localhost:5173"));
        assert!(!config.is_allowed("http://evil.com"));
    }
}
