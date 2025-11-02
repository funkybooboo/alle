use super::{CorsConfig, DatabaseConfig, SecurityConfig, ServerConfig};

/// Main application configuration
#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database: DatabaseConfig,
    pub server: ServerConfig,
    pub cors: CorsConfig,
    pub security: SecurityConfig,
}

impl AppConfig {
    /// Load application configuration from environment
    pub fn from_env() -> Result<Self, String> {
        Ok(Self {
            database: DatabaseConfig::from_env()?,
            server: ServerConfig::from_env()?,
            cors: CorsConfig::from_env()?,
            security: SecurityConfig::from_env()?,
        })
    }

    /// Load .env file and then load configuration
    pub fn load() -> Result<Self, String> {
        // Load .env file if it exists (ignore errors for testing/CI)
        let _ = dotenvy::dotenv();

        Self::from_env()
    }
}

#[cfg(test)]
mod tests {
    use super::AppConfig;

    #[test]
    fn test_app_config_load() {
        let config = AppConfig::load();
        assert!(config.is_ok());
    }
}
