use async_graphql::{InputObject, SimpleObject};

#[derive(SimpleObject, Clone)]
pub struct TaskAttachment {
    pub id: i32,
    pub task_id: i32,
    pub file_name: String,
    pub file_size: i32,
    pub mime_type: String,
    pub uploaded_at: String,
    pub download_url: Option<String>,
}

impl TaskAttachment {
    pub fn from_model(model: super::entity::Model, download_url: String) -> Self {
        Self {
            id: model.id,
            task_id: model.task_id,
            file_name: model.file_name,
            file_size: model.file_size,
            mime_type: model.mime_type,
            uploaded_at: model.uploaded_at.to_string(),
            download_url: Some(download_url),
        }
    }
}

impl From<super::entity::Model> for TaskAttachment {
    fn from(model: super::entity::Model) -> Self {
        Self {
            id: model.id,
            task_id: model.task_id,
            file_name: model.file_name,
            file_size: model.file_size,
            mime_type: model.mime_type,
            uploaded_at: model.uploaded_at.to_string(),
            download_url: None,
        }
    }
}

#[derive(InputObject)]
pub struct CreateTaskAttachmentInput {
    pub task_id: i32,
    pub file_name: String,
    pub file_size: i32,
    pub mime_type: String,
    pub storage_path: String,
}
