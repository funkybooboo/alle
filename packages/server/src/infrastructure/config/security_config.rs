use std::env;

/// Security configuration
#[derive(Debug, Clone)]
pub struct SecurityConfig {
    pub jwt_secret: String,
    pub jwt_expiration: u64,
}

impl SecurityConfig {
    /// Load security configuration from environment
    pub fn from_env() -> Result<Self, String> {
        let jwt_secret = env::var("ALLE_SERVER_JWT_SECRET")
            .unwrap_or_else(|_| "change-this-secret-in-production".to_string());

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

    #[test]
    fn test_default_security_config() {
        let config = SecurityConfig::from_env().unwrap();
        assert_eq!(config.jwt_secret, "change-this-secret-in-production");
        assert_eq!(config.jwt_expiration, 86400);
    }
}
