use super::types::TaskAttachment;
use crate::infrastructure::context::AppContext;
use async_graphql::{Context, Error, Object, Result};
use std::sync::Arc;

#[derive(Default)]
pub struct TaskAttachmentQuery;

#[Object]
impl TaskAttachmentQuery {
    /// Get all attachments for a task
    async fn task_attachments(
        &self,
        ctx: &Context<'_>,
        task_id: i32,
    ) -> Result<Vec<TaskAttachment>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let attachments = app_ctx
            .task_attachments_repository
            .find_by_task(task_id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        // Generate presigned URLs for each attachment
        let mut result = Vec::new();
        for attachment in attachments {
            let download_url = app_ctx
                .minio_client
                .get_presigned_url(&attachment.storage_path, 3600) // 1 hour expiration
                .await
                .map_err(|e| Error::new(format!("Storage error: {}", e)))?;

            let task_attachment = TaskAttachment::from_model(attachment, download_url);
            result.push(task_attachment);
        }

        Ok(result)
    }

    /// Get a specific attachment with download URL
    async fn task_attachment(&self, ctx: &Context<'_>, id: i32) -> Result<Option<TaskAttachment>> {
        let app_ctx = ctx.data::<Arc<AppContext>>()?;

        let attachment = app_ctx
            .task_attachments_repository
            .find_by_id(id)
            .await
            .map_err(|e| Error::new(format!("Database error: {}", e)))?;

        if let Some(attachment) = attachment {
            let download_url = app_ctx
                .minio_client
                .get_presigned_url(&attachment.storage_path, 3600)
                .await
                .map_err(|e| Error::new(format!("Storage error: {}", e)))?;

            let task_attachment = TaskAttachment::from_model(attachment, download_url);
            Ok(Some(task_attachment))
        } else {
            Ok(None)
        }
    }
}
