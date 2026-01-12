use super::types::{CreateTaskAttachmentInput, TaskAttachment};
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct TaskAttachmentMutation;

#[Object]
impl TaskAttachmentMutation {
    /// Create an attachment record (called after file upload via REST endpoint)
    async fn create_task_attachment(
        &self,
        ctx: &Context<'_>,
        input: CreateTaskAttachmentInput,
    ) -> Result<TaskAttachment> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let attachment = app_ctx
            .task_attachments_repository
            .create(
                input.task_id,
                input.file_name,
                input.file_size,
                input.mime_type,
                input.storage_path,
            )
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(TaskAttachment::from(attachment))
    }

    /// Delete an attachment (removes both record and file)
    async fn delete_task_attachment(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        // Get attachment to find storage path
        let attachment = app_ctx
            .task_attachments_repository
            .find_by_id(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?
            .ok_or_else(|| Error::new("Attachment not found"))?;

        // Delete file from MinIO
        app_ctx
            .minio_client
            .delete_file(&attachment.storage_path)
            .await
            .map_err(|e| Error::new(format!("Storage error: {}", e)))?;

        // Delete database record
        let rows_affected = app_ctx
            .task_attachments_repository
            .delete(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(rows_affected > 0)
    }

    /// Delete all attachments from a task
    async fn delete_all_task_attachments(&self, ctx: &Context<'_>, task_id: i32) -> Result<bool> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        // Get all attachments for this task
        let attachments = app_ctx
            .task_attachments_repository
            .find_by_task(task_id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        // Delete all files from MinIO
        for attachment in attachments {
            app_ctx
                .minio_client
                .delete_file(&attachment.storage_path)
                .await
                .map_err(|e| Error::new(format!("Storage error: {}", e)))?;
        }

        // Delete all database records
        let rows_affected = app_ctx
            .task_attachments_repository
            .delete_by_task(task_id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        Ok(rows_affected > 0)
    }
}
