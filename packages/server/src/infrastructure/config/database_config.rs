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

    /// Get a sanitized version of the database URL (without credentials)
    /// This is safe to log and display
    pub fn sanitized_url(&self) -> String {
        // Parse the URL and remove credentials
        if let Some(scheme_end) = self.url.find("://") {
            let scheme = &self.url[..scheme_end + 3];
            let rest = &self.url[scheme_end + 3..];

            // Check if there's an @ symbol indicating credentials
            if let Some(at_pos) = rest.find('@') {
                // Found credentials, skip them
                let host_and_path = &rest[at_pos + 1..];
                format!("{}***:***@{}", scheme, host_and_path)
            } else {
                // No credentials found, return as-is
                self.url.clone()
            }
        } else {
            // Not a standard URL format, return as-is
            self.url.clone()
        }
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

    #[test]
    fn test_sanitized_url_with_credentials() {
        let config = DatabaseConfig {
            url: "postgres://username:password@localhost:5432/mydb".to_string(),
        };
        assert_eq!(
            config.sanitized_url(),
            "postgres://***:***@localhost:5432/mydb"
        );
    }

    #[test]
    fn test_sanitized_url_without_credentials() {
        let config = DatabaseConfig {
            url: "sqlite:./alle.db?mode=rwc".to_string(),
        };
        assert_eq!(config.sanitized_url(), "sqlite:./alle.db?mode=rwc");
    }

    #[test]
    fn test_sanitized_url_no_credentials() {
        let config = DatabaseConfig {
            url: "postgres://localhost/test".to_string(),
        };
        assert_eq!(config.sanitized_url(), "postgres://localhost/test");
    }
}
