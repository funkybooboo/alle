import { useState, useRef } from 'react';
import { taskAttachmentAPI } from '../../api/task-attachment-api';
import type { TaskAttachment } from '../../types/task.types';

interface FileUploadProps {
  taskId: number;
  attachments: TaskAttachment[];
  onAttachmentsChange: (attachments: TaskAttachment[]) => void;
  className?: string;
}

export default function FileUpload({
  taskId,
  attachments,
  onAttachmentsChange,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(`Uploading ${file.name}...`);

      await taskAttachmentAPI.uploadFile(taskId, file);

      // Refresh attachments list
      const updatedAttachments = await taskAttachmentAPI.getTaskAttachments(
        taskId
      );
      onAttachmentsChange(updatedAttachments);

      setUploadProgress(null);
      setUploading(false);
    } catch (err) {
      console.error('Failed to upload file:', err);
      setUploadProgress(null);
      setUploading(false);
      alert('Failed to upload file. Please try again.');
    }
  };

  // Handle file selection via input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  // Handle file download
  const handleDownload = async (attachment: TaskAttachment) => {
    if (!attachment.downloadUrl) {
      alert('Download URL not available');
      return;
    }

    try {
      await taskAttachmentAPI.downloadFile(
        attachment.downloadUrl,
        attachment.fileName
      );
    } catch (err) {
      console.error('Failed to download file:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  // Handle file deletion
  const handleDelete = async (attachmentId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await taskAttachmentAPI.deleteTaskAttachment(attachmentId);
      onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId));
    } catch (err) {
      console.error('Failed to delete file:', err);
      alert('Failed to delete file. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
    if (mimeType.includes('text')) return '📝';
    return '📎';
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-4xl">📎</div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {uploading ? uploadProgress : 'Click or drag files to upload'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Maximum file size: 50MB
          </p>
        </div>
      </div>

      {/* Attachments list */}
      <div className="flex flex-col gap-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl">{getFileIcon(attachment.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.fileName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(attachment.fileSize)}</span>
                  <span>•</span>
                  <span>
                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {attachment.downloadUrl && (
                <button
                  onClick={() => handleDownload(attachment)}
                  className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  title="Download file"
                >
                  Download
                </button>
              )}
              <button
                onClick={() => handleDelete(attachment.id)}
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                title="Delete file"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {attachments.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-4">
            No attachments yet
          </p>
        )}
      </div>
    </div>
  );
}
