import { useState } from 'react';
import type { TaskItemProps } from './TaskItem.types';

export const TaskItem = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  className = '',
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleToggle = () => {
    onToggle?.(task.id);
  };

  const handleDelete = () => {
    onDelete?.(task.id);
  };

  const handleEdit = () => {
    if (isEditing && editText.trim() && editText !== task.text) {
      onEdit?.(task.id, editText);
    }
    setIsEditing(!isEditing);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group flex items-center gap-2 py-2 px-3 hover:bg-gray-50 transition-colors ${className}`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center"
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed && (
          <span
            className="material-symbols-outlined text-sm"
            aria-hidden="true"
          >
            check
          </span>
        )}
      </button>

      {/* Task Text */}
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-left px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
            task.completed ? 'line-through text-gray-400' : ''
          }`}
        >
          {task.text}
        </button>
      )}

      {/* Delete Button */}
      <button
        type="button"
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
