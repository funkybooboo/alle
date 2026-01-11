use std::env;

/// MinIO/S3 storage configuration
#[derive(Debug, Clone)]
pub struct MinioConfig {
    pub endpoint: String,
    pub access_key: String,
    pub secret_key: String,
    pub bucket: String,
    pub use_ssl: bool,
    pub region: String,
}

impl MinioConfig {
    /// Load MinIO configuration from environment
    pub fn from_env() -> Result<Self, String> {
        let endpoint = env::var("ALLE_SERVER_MINIO_ENDPOINT")
            .unwrap_or_else(|_| "localhost:9000".to_string());

        let access_key = env::var("ALLE_SERVER_MINIO_ACCESS_KEY")
            .map_err(|_| "ALLE_SERVER_MINIO_ACCESS_KEY not set".to_string())?;

        let secret_key = env::var("ALLE_SERVER_MINIO_SECRET_KEY")
            .map_err(|_| "ALLE_SERVER_MINIO_SECRET_KEY not set".to_string())?;

        let bucket = env::var("ALLE_SERVER_MINIO_BUCKET")
            .unwrap_or_else(|_| "alle-attachments".to_string());

        let use_ssl = env::var("ALLE_SERVER_MINIO_USE_SSL")
            .unwrap_or_else(|_| "false".to_string())
            .parse::<bool>()
            .unwrap_or(false);

        let region = env::var("ALLE_SERVER_MINIO_REGION")
            .unwrap_or_else(|_| "us-east-1".to_string());

        Ok(Self {
            endpoint,
            access_key,
            secret_key,
            bucket,
            use_ssl,
            region,
        })
    }

    /// Get the full URL for the MinIO endpoint
    pub fn url(&self) -> String {
        let protocol = if self.use_ssl { "https" } else { "http" };
        format!("{}://{}", protocol, self.endpoint)
    }
}

#[cfg(test)]
mod tests {
    use super::MinioConfig;
    use std::env;

    #[test]
    fn test_minio_url() {
        let config = MinioConfig {
            endpoint: "localhost:9000".to_string(),
            access_key: "test".to_string(),
            secret_key: "test".to_string(),
            bucket: "test-bucket".to_string(),
            use_ssl: false,
            region: "us-east-1".to_string(),
        };
        assert_eq!(config.url(), "http://localhost:9000");

        let config_ssl = MinioConfig {
            endpoint: "s3.amazonaws.com".to_string(),
            access_key: "test".to_string(),
            secret_key: "test".to_string(),
            bucket: "test-bucket".to_string(),
            use_ssl: true,
            region: "us-east-1".to_string(),
        };
        assert_eq!(config_ssl.url(), "https://s3.amazonaws.com");
    }

    #[test]
    fn test_minio_from_env() {
        env::set_var("ALLE_SERVER_MINIO_ENDPOINT", "minio:9000");
        env::set_var("ALLE_SERVER_MINIO_ACCESS_KEY", "test_access");
        env::set_var("ALLE_SERVER_MINIO_SECRET_KEY", "test_secret");
        env::set_var("ALLE_SERVER_MINIO_BUCKET", "test-bucket");
        env::set_var("ALLE_SERVER_MINIO_USE_SSL", "false");

        let config = MinioConfig::from_env().unwrap();
        assert_eq!(config.endpoint, "minio:9000");
        assert_eq!(config.access_key, "test_access");
        assert_eq!(config.secret_key, "test_secret");
        assert_eq!(config.bucket, "test-bucket");
        assert_eq!(config.use_ssl, false);

        // Cleanup
        env::remove_var("ALLE_SERVER_MINIO_ENDPOINT");
        env::remove_var("ALLE_SERVER_MINIO_ACCESS_KEY");
        env::remove_var("ALLE_SERVER_MINIO_SECRET_KEY");
        env::remove_var("ALLE_SERVER_MINIO_BUCKET");
        env::remove_var("ALLE_SERVER_MINIO_USE_SSL");
    }
}
