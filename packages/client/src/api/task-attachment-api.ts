import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type { TaskAttachment } from '../types/task.types';

// GraphQL Queries
const GET_TASK_ATTACHMENTS = gql`
  query GetTaskAttachments($taskId: Int!) {
    taskAttachments(taskId: $taskId) {
      id
      taskId
      fileName
      fileSize
      mimeType
      uploadedAt
      downloadUrl
    }
  }
`;

const DELETE_TASK_ATTACHMENT = gql`
  mutation DeleteTaskAttachment($id: Int!) {
    deleteTaskAttachment(id: $id)
  }
`;

// GraphQL response types
interface GraphQLTaskAttachment {
  id: number;
  taskId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl?: string | null;
}

// REST response types
interface UploadResponse {
  id: number;
  file_name: string;
  file_size: number;
  storage_path: string;
  message: string;
}

// Convert GraphQL attachment to frontend type
const toTaskAttachment = (gqlAttachment: GraphQLTaskAttachment): TaskAttachment => ({
  id: gqlAttachment.id,
  taskId: gqlAttachment.taskId,
  fileName: gqlAttachment.fileName,
  fileSize: gqlAttachment.fileSize,
  mimeType: gqlAttachment.mimeType,
  uploadedAt: gqlAttachment.uploadedAt,
  downloadUrl: gqlAttachment.downloadUrl ?? null,
});

// API functions
export const taskAttachmentAPI = {
  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    const data = await graphqlClient.request<{
      taskAttachments: GraphQLTaskAttachment[];
    }>(GET_TASK_ATTACHMENTS, { taskId });
    return data.taskAttachments.map(toTaskAttachment);
  },

  async uploadFile(taskId: number, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('task_id', taskId.toString());
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  },

  async deleteTaskAttachment(id: number): Promise<boolean> {
    const data = await graphqlClient.request<{
      deleteTaskAttachment: boolean;
    }>(DELETE_TASK_ATTACHMENT, { id });
    return data.deleteTaskAttachment;
  },

  async downloadFile(downloadUrl: string, fileName: string): Promise<void> {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
