use std::env;

/// Database configuration
#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    pub url: String,
}

impl DatabaseConfig {
    /// Load database configuration from environment
    pub fn from_env() -> Result<Self, String> {
        let url = env::var("ALLE_SERVER_DATABASE_URL")
            .unwrap_or_else(|_| "sqlite:./alle.db?mode=rwc".to_string());

        Ok(Self { url })
    }

    /// Get database URL
    pub fn url(&self) -> &str {
        &self.url
    }
}

#[cfg(test)]
mod tests {
    use super::DatabaseConfig;

    #[test]
    fn test_default_database_config() {
        let config = DatabaseConfig::from_env().unwrap();
        assert_eq!(config.url(), "sqlite:./alle.db?mode=rwc");
    }

    #[test]
    fn test_database_url_getter() {
        let config = DatabaseConfig {
            url: "postgres://localhost/test".to_string(),
        };
        assert_eq!(config.url(), "postgres://localhost/test");
    }
}
