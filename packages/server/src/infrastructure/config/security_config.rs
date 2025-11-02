use std::env;

use super::ServerConfig;

/// Security configuration
#[derive(Debug, Clone)]
pub struct SecurityConfig {
    pub jwt_secret: String,
    pub jwt_expiration: u64,
}

impl SecurityConfig {
    /// Load security configuration from environment
    pub fn from_env() -> Result<Self, String> {
        // Load server config to check environment
        let server_config = ServerConfig::from_env()?;

        let jwt_secret = match env::var("ALLE_SERVER_JWT_SECRET") {
            Ok(secret) => secret,
            Err(_) => {
                if server_config.is_production() {
                    return Err(
                        "ALLE_SERVER_JWT_SECRET environment variable is required in production mode. \
                        Please set a secure JWT secret.".to_string()
                    );
                } else {
                    eprintln!(
                        "WARNING: Using default JWT secret. This is insecure and should only be used in development. \
                        Set ALLE_SERVER_JWT_SECRET environment variable for production."
                    );
                    "change-this-secret-in-production".to_string()
                }
            }
        };

        let jwt_expiration = env::var("ALLE_SERVER_JWT_EXPIRATION")
            .unwrap_or_else(|_| "86400".to_string())
            .parse::<u64>()
            .map_err(|e| format!("Invalid JWT expiration: {}", e))?;

        Ok(Self {
            jwt_secret,
            jwt_expiration,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::SecurityConfig;
    use std::env;
    use std::sync::Mutex;

    // Mutex to prevent tests from running in parallel and interfering with each other
    static TEST_MUTEX: Mutex<()> = Mutex::new(());

    #[test]
    fn test_default_security_config_in_development() {
        let _guard = TEST_MUTEX.lock().unwrap();

        // Clear any existing JWT secret for this test
        env::remove_var("ALLE_SERVER_JWT_SECRET");
        env::remove_var("ALLE_SERVER_ENV");

        let config = SecurityConfig::from_env().unwrap();
        assert_eq!(config.jwt_secret, "change-this-secret-in-production");
        assert_eq!(config.jwt_expiration, 86400);
    }

    #[test]
    fn test_production_requires_jwt_secret() {
        let _guard = TEST_MUTEX.lock().unwrap();

        // Clear JWT secret and set production environment
        env::remove_var("ALLE_SERVER_JWT_SECRET");
        env::set_var("ALLE_SERVER_ENV", "production");

        let result = SecurityConfig::from_env();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("required in production mode"));

        // Cleanup
        env::remove_var("ALLE_SERVER_ENV");
    }

    #[test]
    fn test_custom_jwt_secret() {
        let _guard = TEST_MUTEX.lock().unwrap();

        env::set_var("ALLE_SERVER_JWT_SECRET", "custom-secret-key");
        env::remove_var("ALLE_SERVER_ENV");

        let config = SecurityConfig::from_env().unwrap();
        assert_eq!(config.jwt_secret, "custom-secret-key");

        // Cleanup
        env::remove_var("ALLE_SERVER_JWT_SECRET");
    }
}
