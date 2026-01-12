import { useState, useEffect } from 'react';
import type { TaskWithMetadata, TaskTag, TaskLink, TaskAttachment } from '../../types/task.types';
import { taskAPI } from '../../api/task-api';
import { taskTagAPI } from '../../api/task-tag-api';
import { taskLinkAPI } from '../../api/task-link-api';
import { taskAttachmentAPI } from '../../api/task-attachment-api';
import PanelModal from '../shared/PanelModal';
import LoadingSpinner from '../shared/LoadingSpinner';
import MarkdownEditor from '../markdown/MarkdownEditor';
import ColorPicker from './ColorPicker';
import TagInput from './TagInput';
import LinksManager from './LinksManager';
import FileUpload from './FileUpload';

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

  // Handle tags update
  const handleTagsChange = (tags: TaskTag[]) => {
    if (!task) return;
    const newTask = { ...task, tags };
    setTask(newTask);
    onTaskUpdate?.(newTask);
  };

  // Handle links update
  const handleLinksChange = (links: TaskLink[]) => {
    if (!task) return;
    const newTask = { ...task, links };
    setTask(newTask);
    onTaskUpdate?.(newTask);
  };

  // Handle attachments update
  const handleAttachmentsChange = (attachments: TaskAttachment[]) => {
    if (!task) return;
    const newTask = { ...task, attachments };
    setTask(newTask);
    onTaskUpdate?.(newTask);
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
    <PanelModal isOpen={isOpen} onClose={onClose} title="Task Details">
      <div className="flex flex-col gap-6 p-6 max-h-[80vh] overflow-y-auto">
        {/* Task Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <input
              type="text"
              value={task.title}
              onChange={(e) => handleUpdateTask({ title: e.target.value })}
              className="text-2xl font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none flex-1 py-1"
              placeholder="Task title..."
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => handleUpdateTask({ completed: e.target.checked })}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="text-sm font-medium">Complete</span>
            </label>
          </div>

          {/* Context Information */}
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            {task.date && (
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{new Date(task.date).toLocaleDateString()}</span>
              </div>
            )}
            {task.listId && (
              <div className="flex items-center gap-1">
                <span>📋</span>
                <span>Someday List #{task.listId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Color Picker */}
        <ColorPicker
          value={task.color}
          onChange={(color) => handleUpdateTask({ color })}
        />

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Tags */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Tags</h3>
          <TagInput
            taskId={taskId}
            tags={task.tags}
            onTagsChange={handleTagsChange}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Notes */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Notes</h3>
          <MarkdownEditor
            value={task.notes || ''}
            onChange={(notes) => handleUpdateTask({ notes })}
            placeholder="Add notes in markdown format..."
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Links</h3>
          <LinksManager
            taskId={taskId}
            links={task.links}
            onLinksChange={handleLinksChange}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Attachments */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Attachments</h3>
          <FileUpload
            taskId={taskId}
            attachments={task.attachments}
            onAttachmentsChange={handleAttachmentsChange}
          />
        </div>

        {/* Metadata Footer */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
          <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(task.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </PanelModal>
  );
}
