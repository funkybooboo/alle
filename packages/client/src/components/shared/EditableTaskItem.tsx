import { useState, memo } from 'react';
import { MarkdownText } from './MarkdownText';

export interface EditableTaskItemProps {
  id: string | number;
  text: string;
  completed: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  onEdit?: (newText: string) => void;
  onView?: () => void;
  className?: string;
  testId?: string;
}

const EditableTaskItemComponent = ({
  text,
  completed,
  onToggle,
  onDelete,
  onEdit,
  onView,
  className = '',
  testId,
}: EditableTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleToggle = () => {
    onToggle?.();
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const handleEdit = () => {
    if (isEditing && editText.trim() && editText !== text) {
      onEdit?.(editText);
    }
    setIsEditing(!isEditing);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(text);
      setIsEditing(false);
    }
  };

  return (
    <div
      data-testid={testId}
      className={`group flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors ${className}`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        className="flex-shrink-0 w-5 h-5 border-2 border-gray-400 dark:border-gray-600 rounded hover:border-gray-600 dark:hover:border-gray-500 transition-colors cursor-pointer"
        aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
      />

      {/* Task Text */}
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
          autoFocus
          aria-label="Edit task text"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-left text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors cursor-pointer ${
            completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
          }`}
          aria-label={`Edit task: ${text}`}
        >
          <MarkdownText>{text}</MarkdownText>
        </button>
      )}

      {/* View Button - Visible on hover or focus */}
      {onView && (
        <button
          type="button"
          data-testid={testId ? `${testId}-view-button` : undefined}
          onClick={onView}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
          aria-label="View task details"
        >
          <span
            className="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          >
            info
          </span>
        </button>
      )}

      {/* Delete Button - Visible on hover or focus */}
      <button
        type="button"
        data-testid={testId ? `${testId}-delete-button` : undefined}
        onClick={handleDelete}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
        aria-label="Delete task"
      >
        <span
          className="material-symbols-outlined text-sm text-red-600 dark:text-red-400"
          aria-hidden="true"
        >
          close
        </span>
      </button>
    </div>
  );
};

export const EditableTaskItem = memo(EditableTaskItemComponent);
