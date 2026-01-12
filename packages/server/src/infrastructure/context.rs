use crate::domains::color_presets::ColorPresetRepository;
use crate::domains::settings::SettingsRepository;
use crate::domains::someday::{SomedayListsRepository, SomedayTasksRepository};
use crate::domains::tag_presets::TagPresetRepository;
use crate::domains::task_attachments::TaskAttachmentRepository;
use crate::domains::task_links::TaskLinkRepository;
use crate::domains::task_tags::TaskTagRepository;
use crate::domains::tasks::TaskRepository;
use crate::domains::trash::TrashRepository;
use crate::infrastructure::storage::minio_client::MinioClient;
use sea_orm::DatabaseConnection;
use std::sync::Arc;

/// Application context holding all dependencies
pub struct AppContext {
    pub task_repository: Arc<TaskRepository>,
    pub settings_repository: Arc<SettingsRepository>,
    pub someday_lists_repository: Arc<SomedayListsRepository>,
    pub someday_tasks_repository: Arc<SomedayTasksRepository>,
    pub trash_repository: Arc<TrashRepository>,
    pub task_tags_repository: Arc<TaskTagRepository>,
    pub task_links_repository: Arc<TaskLinkRepository>,
    pub task_attachments_repository: Arc<TaskAttachmentRepository>,
    pub tag_presets_repository: Arc<TagPresetRepository>,
    pub color_presets_repository: Arc<ColorPresetRepository>,
    pub minio_client: Arc<MinioClient>,
}

impl AppContext {
    pub fn new(db: DatabaseConnection, minio_client: MinioClient) -> Self {
        Self {
            task_repository: Arc::new(TaskRepository::new(db.clone())),
            settings_repository: Arc::new(SettingsRepository::new(db.clone())),
            someday_lists_repository: Arc::new(SomedayListsRepository::new(db.clone())),
            someday_tasks_repository: Arc::new(SomedayTasksRepository::new(db.clone())),
            trash_repository: Arc::new(TrashRepository::new(db.clone())),
            task_tags_repository: Arc::new(TaskTagRepository::new(db.clone())),
            task_links_repository: Arc::new(TaskLinkRepository::new(db.clone())),
            task_attachments_repository: Arc::new(TaskAttachmentRepository::new(db.clone())),
            tag_presets_repository: Arc::new(TagPresetRepository::new(db.clone())),
            color_presets_repository: Arc::new(ColorPresetRepository::new(db)),
            minio_client: Arc::new(minio_client),
        }
    }
}

impl Clone for AppContext {
    fn clone(&self) -> Self {
        Self {
            task_repository: Arc::clone(&self.task_repository),
            settings_repository: Arc::clone(&self.settings_repository),
            someday_lists_repository: Arc::clone(&self.someday_lists_repository),
            someday_tasks_repository: Arc::clone(&self.someday_tasks_repository),
            trash_repository: Arc::clone(&self.trash_repository),
            task_tags_repository: Arc::clone(&self.task_tags_repository),
            task_links_repository: Arc::clone(&self.task_links_repository),
            task_attachments_repository: Arc::clone(&self.task_attachments_repository),
            tag_presets_repository: Arc::clone(&self.tag_presets_repository),
            color_presets_repository: Arc::clone(&self.color_presets_repository),
            minio_client: Arc::clone(&self.minio_client),
        }
    }
}
