use std::env;

/// Server configuration
#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub environment: Environment,
    pub log_level: String,
}

/// Application environment
#[derive(Debug, Clone, PartialEq)]
pub enum Environment {
    Development,
    Production,
}

impl ServerConfig {
    /// Load server configuration from environment
    pub fn from_env() -> Result<Self, String> {
        let host = env::var("ALLE_SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());

        let port = env::var("ALLE_SERVER_PORT")
            .unwrap_or_else(|_| "8000".to_string())
            .parse::<u16>()
            .map_err(|e| format!("Invalid port: {}", e))?;

        let environment = env::var("ALLE_SERVER_ENV")
            .unwrap_or_else(|_| "development".to_string())
            .parse::<Environment>()?;

        let log_level = env::var("ALLE_SERVER_LOG_LEVEL").unwrap_or_else(|_| "info".to_string());

        Ok(Self {
            host,
            port,
            environment,
            log_level,
        })
    }

    /// Get server address
    pub fn address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }

    /// Check if running in production
    pub fn is_production(&self) -> bool {
        self.environment == Environment::Production
    }
}

impl std::str::FromStr for Environment {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "development" | "dev" => Ok(Environment::Development),
            "production" | "prod" => Ok(Environment::Production),
            _ => Err(format!("Invalid environment: {}", s)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{Environment, ServerConfig};

    #[test]
    fn test_default_server_config() {
        let config = ServerConfig::from_env().unwrap();
        assert_eq!(config.host, "0.0.0.0");
        assert_eq!(config.port, 8000);
        assert_eq!(config.environment, Environment::Development);
        assert_eq!(config.log_level, "info");
    }

    #[test]
    fn test_server_address() {
        let config = ServerConfig {
            host: "127.0.0.1".to_string(),
            port: 3000,
            environment: Environment::Development,
            log_level: "debug".to_string(),
        };
        assert_eq!(config.address(), "127.0.0.1:3000");
    }

    #[test]
    fn test_is_production() {
        let dev_config = ServerConfig {
            host: "0.0.0.0".to_string(),
            port: 8000,
            environment: Environment::Development,
            log_level: "info".to_string(),
        };
        assert!(!dev_config.is_production());

        let prod_config = ServerConfig {
            host: "0.0.0.0".to_string(),
            port: 8000,
            environment: Environment::Production,
            log_level: "warn".to_string(),
        };
        assert!(prod_config.is_production());
    }

    #[test]
    fn test_environment_parsing() {
        assert_eq!(
            "development".parse::<Environment>().unwrap(),
            Environment::Development
        );
        assert_eq!(
            "dev".parse::<Environment>().unwrap(),
            Environment::Development
        );
        assert_eq!(
            "production".parse::<Environment>().unwrap(),
            Environment::Production
        );
        assert_eq!(
            "prod".parse::<Environment>().unwrap(),
            Environment::Production
        );
        assert!("invalid".parse::<Environment>().is_err());
        assert!("staging".parse::<Environment>().is_err());
    }
}
