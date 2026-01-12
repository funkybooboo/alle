use crate::domains::task_attachments::TaskAttachmentRepository;
use crate::infrastructure::storage::MinioClient;
use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    response::Json,
};
use serde::Serialize;
use std::sync::Arc;

pub struct UploadState {
    pub minio_client: Arc<MinioClient>,
    pub attachment_repository: Arc<TaskAttachmentRepository>,
}

#[derive(Serialize)]
pub struct UploadResponse {
    pub id: i32,
    pub file_name: String,
    pub file_size: i32,
    pub storage_path: String,
    pub message: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

/// Upload a file attachment for a task
pub async fn upload_file(
    State(state): State<Arc<UploadState>>,
    mut multipart: Multipart,
) -> Result<Json<UploadResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut task_id: Option<i32> = None;
    let mut file_name: Option<String> = None;
    let mut file_data: Option<Vec<u8>> = None;
    let mut content_type: Option<String> = None;

    // Parse multipart form data
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Failed to read multipart field: {}", e),
                }),
            )
        })?
    {
        let name = field.name().unwrap_or("").to_string();

        match name.as_str() {
            "task_id" => {
                let text = field.text().await.map_err(|e| {
                    (
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: format!("Failed to read task_id: {}", e),
                        }),
                    )
                })?;
                task_id = Some(text.parse().map_err(|e| {
                    (
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: format!("Invalid task_id: {}", e),
                        }),
                    )
                })?);
            }
            "file" => {
                file_name = field.file_name().map(|s| s.to_string());
                content_type = field.content_type().map(|s| s.to_string());
                file_data = Some(field.bytes().await.map_err(|e| {
                    (
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: format!("Failed to read file data: {}", e),
                        }),
                    )
                })?.to_vec());
            }
            _ => {}
        }
    }

    // Validate required fields
    let task_id = task_id.ok_or_else(|| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "task_id is required".to_string(),
            }),
        )
    })?;

    let file_name = file_name.ok_or_else(|| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "file is required".to_string(),
            }),
        )
    })?;

    let file_data = file_data.ok_or_else(|| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "file data is required".to_string(),
            }),
        )
    })?;

    let content_type = content_type.unwrap_or_else(|| "application/octet-stream".to_string());

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE: usize = 50 * 1024 * 1024;
    if file_data.len() > MAX_FILE_SIZE {
        return Err((
            StatusCode::PAYLOAD_TOO_LARGE,
            Json(ErrorResponse {
                error: format!("File size exceeds maximum of {} MB", MAX_FILE_SIZE / 1024 / 1024),
            }),
        ));
    }

    // Upload to MinIO
    let storage_path = state
        .minio_client
        .upload_file(task_id, &file_name, &file_data, &content_type)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Failed to upload file: {}", e),
                }),
            )
        })?;

    // Create database record
    let attachment = state
        .attachment_repository
        .create(
            task_id,
            file_name.clone(),
            file_data.len() as i32,
            content_type,
            storage_path.clone(),
        )
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Failed to create attachment record: {}", e),
                }),
            )
        })?;

    Ok(Json(UploadResponse {
        id: attachment.id,
        file_name,
        file_size: attachment.file_size,
        storage_path,
        message: "File uploaded successfully".to_string(),
    }))
}
