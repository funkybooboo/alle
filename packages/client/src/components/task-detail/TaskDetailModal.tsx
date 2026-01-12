import { useState, useEffect } from 'react';
import type { TaskWithMetadata } from '../../types/task.types';
import { taskAPI } from '../../api/task-api';
import { taskTagAPI } from '../../api/task-tag-api';
import { taskLinkAPI } from '../../api/task-link-api';
import { taskAttachmentAPI } from '../../api/task-attachment-api';
import PanelModal from '../shared/PanelModal';
import LoadingSpinner from '../shared/LoadingSpinner';

interface TaskDetailModalProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: (task: TaskWithMetadata) => void;
}

export default function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
  onTaskUpdate,
}: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskWithMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load task with all metadata
  useEffect(() => {
    if (!isOpen || !taskId) return;

    const loadTask = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load task and metadata in parallel
        const [taskData, tags, links, attachments] = await Promise.all([
          taskAPI.getTaskById(taskId),
          taskTagAPI.getTaskTags(taskId),
          taskLinkAPI.getTaskLinks(taskId),
          taskAttachmentAPI.getTaskAttachments(taskId),
        ]);

        const taskWithMetadata: TaskWithMetadata = {
          ...taskData,
          tags,
          links,
          attachments,
        };

        setTask(taskWithMetadata);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load task:', err);
        setError('Failed to load task details');
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId, isOpen]);

  // Update task field
  const handleUpdateTask = async (updates: Partial<TaskWithMetadata>) => {
    if (!task) return;

    try {
      const updatedTask = await taskAPI.updateTask(taskId, {
        title: updates.title,
        completed: updates.completed,
        date: updates.date?.toISOString() ?? undefined,
        listId: updates.listId ?? undefined,
        position: updates.position ?? undefined,
        notes: updates.notes ?? undefined,
        color: updates.color ?? undefined,
      });

      const newTask: TaskWithMetadata = {
        ...updatedTask,
        tags: task.tags,
        links: task.links,
        attachments: task.attachments,
      };

      setTask(newTask);
      onTaskUpdate?.(newTask);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <PanelModal isOpen={isOpen} onClose={onClose} title="Task Details">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </PanelModal>
    );
  }

  // Render error state
  if (error || !task) {
    return (
      <PanelModal isOpen={isOpen} onClose={onClose} title="Task Details">
        <div className="p-4 text-red-500">{error || 'Task not found'}</div>
      </PanelModal>
    );
  }

  return (
    <PanelModal isOpen={isOpen} onClose={onClose} title={task.title}>
      <div className="flex flex-col gap-6 p-6">
        {/* Task Header */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={task.title}
            onChange={(e) => handleUpdateTask({ title: e.target.value })}
            className="text-2xl font-semibold bg-transparent border-none focus:outline-none flex-1"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => handleUpdateTask({ completed: e.target.checked })}
              className="w-5 h-5"
            />
            <span>Complete</span>
          </label>
        </div>

        {/* Color Indicator */}
        {task.color && (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: task.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {task.color}
            </span>
          </div>
        )}

        {/* Context Information */}
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          {task.date && (
            <div>
              <strong>Date:</strong> {new Date(task.date).toLocaleDateString()}
            </div>
          )}
          {task.listId && (
            <div>
              <strong>List ID:</strong> {task.listId}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <textarea
            value={task.notes || ''}
            onChange={(e) => handleUpdateTask({ notes: e.target.value })}
            placeholder="Add notes in markdown format..."
            className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 resize-y font-mono text-sm"
          />
        </div>

        {/* Tags Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {task.tags && task.tags.length > 0 ? (
              task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {tag.tagName}
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No tags added
              </p>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Links</h3>
          <div className="flex flex-col gap-2">
            {task.links && task.links.length > 0 ? (
              task.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {link.title || link.url}
                </a>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No links added
              </p>
            )}
          </div>
        </div>

        {/* Attachments Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Attachments</h3>
          <div className="flex flex-col gap-2">
            {task.attachments && task.attachments.length > 0 ? (
              task.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  <span className="text-sm">{attachment.fileName}</span>
                  <span className="text-xs text-gray-500">
                    {(attachment.fileSize / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No attachments added
              </p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(task.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </PanelModal>
  );
}
