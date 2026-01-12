use crate::infrastructure::config::MinioConfig;
use s3::bucket::Bucket;
use s3::creds::Credentials;
use s3::Region;
use std::sync::Arc;
use uuid::Uuid;

/// MinIO/S3 client wrapper
#[derive(Clone)]
pub struct MinioClient {
    bucket: Arc<Bucket>,
}

impl MinioClient {
    /// Create a new MinIO client from configuration
    pub async fn new(config: MinioConfig) -> Result<Self, Box<dyn std::error::Error>> {
        // Create credentials
        let credentials = Credentials::new(
            Some(&config.access_key),
            Some(&config.secret_key),
            None,
            None,
            None,
        )?;

        // Create custom region for MinIO
        let region = Region::Custom {
            region: config.region.clone(),
            endpoint: config.url(),
        };

        // Create bucket
        let mut bucket = Bucket::new(
            &config.bucket,
            region,
            credentials,
        )?;

        // Create bucket if it doesn't exist
        bucket = if config.use_ssl {
            bucket.with_path_style()
        } else {
            bucket
        };

        // Note: Bucket must be created manually in MinIO console or via mc client
        // Example: mc mb minio/alle-attachments
        println!("Using MinIO bucket: {}", config.bucket);

        Ok(Self {
            bucket: Arc::new(*bucket),
        })
    }

    /// Upload a file to storage
    /// Returns the storage path (key)
    pub async fn upload_file(
        &self,
        task_id: i32,
        file_name: &str,
        content: &[u8],
        content_type: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        // Generate unique file path
        let uuid = Uuid::new_v4();
        let sanitized_name = Self::sanitize_filename(file_name);
        let storage_path = format!("tasks/{}/{}_{}", task_id, uuid, sanitized_name);

        // Upload to MinIO
        self.bucket
            .put_object_with_content_type(&storage_path, content, content_type)
            .await?;

        Ok(storage_path)
    }

    /// Get a presigned URL for downloading a file (expires in 1 hour)
    pub async fn get_presigned_url(
        &self,
        storage_path: &str,
        expires_in_secs: u32,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let url = self.bucket.presign_get(storage_path, expires_in_secs, None).await?;
        Ok(url)
    }

    /// Delete a file from storage
    pub async fn delete_file(
        &self,
        storage_path: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.bucket.delete_object(storage_path).await?;
        Ok(())
    }

    /// Check if a file exists
    pub async fn file_exists(
        &self,
        storage_path: &str,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        match self.bucket.head_object(storage_path).await {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }

    /// Get file metadata (size, content type)
    pub async fn get_file_metadata(
        &self,
        storage_path: &str,
    ) -> Result<(u64, String), Box<dyn std::error::Error>> {
        let (head, _) = self.bucket.head_object(storage_path).await?;
        let size = head
            .content_length
            .ok_or("No content length in response")?;
        let content_type = head
            .content_type
            .unwrap_or_else(|| "application/octet-stream".to_string());
        Ok((size as u64, content_type))
    }

    /// Sanitize filename to prevent path traversal and other issues
    fn sanitize_filename(filename: &str) -> String {
        filename
            .chars()
            .map(|c| {
                if c.is_alphanumeric() || c == '.' || c == '_' || c == '-' {
                    c
                } else {
                    '_'
                }
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_filename() {
        assert_eq!(
            MinioClient::sanitize_filename("test file.pdf"),
            "test_file.pdf"
        );
        assert_eq!(
            MinioClient::sanitize_filename("../../etc/passwd"),
            ".._.._ etc_passwd"
        );
        assert_eq!(
            MinioClient::sanitize_filename("file<>:\"|?*.txt"),
            "file_________.txt"
        );
        assert_eq!(
            MinioClient::sanitize_filename("normal_file-123.png"),
            "normal_file-123.png"
        );
    }
}
