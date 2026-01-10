import { useState, memo } from 'react';
import { MarkdownText } from './MarkdownText';

export interface EditableTaskItemProps {
  id: string | number;
  text: string;
  completed: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  onEdit?: (newText: string) => void;
  className?: string;
  testId?: string;
}

const EditableTaskItemComponent = ({
  id,
  text,
  completed,
  onToggle,
  onDelete,
  onEdit,
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
      className={`group flex items-center gap-2 py-2 px-3 hover:bg-gray-50 transition-colors ${className}`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded hover:border-gray-400 transition-colors cursor-pointer"
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
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-left text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
            completed ? 'line-through text-gray-400' : ''
          }`}
        >
          <MarkdownText>{text}</MarkdownText>
        </div>
      )}

      {/* Delete Button */}
      <button
        type="button"
        data-testid={testId ? `${testId}-delete-button` : undefined}
        onClick={handleDelete}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
        aria-label="Delete task"
      >
        <span className="material-symbols-outlined text-sm text-red-600">
          close
        </span>
      </button>
    </div>
  );
};

export const EditableTaskItem = memo(EditableTaskItemComponent);
