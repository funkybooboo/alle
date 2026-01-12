// Unified Task type matching backend schema

export interface Task {
  id: string;
  title: string;
  completed: boolean;

  // Context fields - either calendar or someday
  date?: Date | null;           // Set for calendar tasks
  listId?: number | null;       // Set for someday tasks
  position?: number | null;     // Set for someday tasks

  // Enhanced metadata
  notes?: string | null;
  color?: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Related data (loaded separately)
  tags?: TaskTag[];
  links?: TaskLink[];
  attachments?: TaskAttachment[];
}

export interface TaskTag {
  id: number;
  taskId: number;
  tagName: string;
  createdAt: string;
}

export interface TaskLink {
  id: number;
  taskId: number;
  url: string;
  title?: string | null;
  position: number;
  createdAt: string;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl?: string | null;
}

// Input types for creating/updating tasks
export interface CreateTaskInput {
  title: string;
  date?: string | null;
  listId?: number | null;
  position?: number | null;
  notes?: string | null;
  color?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  completed?: boolean;
  date?: string | null;
  listId?: number | null;
  position?: number | null;
  notes?: string | null;
  color?: string | null;
}

// Tag and color presets
export interface TagPreset {
  id: number;
  name: string;
  usageCount: number;
  createdAt: string;
}

export interface ColorPreset {
  id: number;
  name: string;
  hexValue: string;
  position: number;
  createdAt: string;
}

// Input types for tags and links
export interface AddTaskTagInput {
  taskId: number;
  tagName: string;
}

export interface AddTaskLinkInput {
  taskId: number;
  url: string;
  title?: string | null;
}

export interface UpdateTaskLinkInput {
  id: number;
  url?: string;
  title?: string | null;
  position?: number;
}

// Utility type for task with all metadata loaded
export interface TaskWithMetadata extends Task {
  tags: TaskTag[];
  links: TaskLink[];
  attachments: TaskAttachment[];
}
