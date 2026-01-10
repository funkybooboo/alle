import { useState } from 'react';

export interface EditableHeaderProps {
  name: string;
  onEdit?: (name: string) => void;
  onDelete?: () => void;
}

export const EditableHeader = ({
  name,
  onEdit,
  onDelete,
}: EditableHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  const handleSubmit = () => {
    if (editName.trim() && editName !== name) {
      onEdit?.(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(name);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        className="w-full px-2 py-1 text-sm font-semibold border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
        aria-label="Edit list name"
        placeholder="List name"
      />
    );
  }

  return (
    <div className="group flex items-center justify-between">
      <h2
        className="text-sm font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => setIsEditing(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsEditing(true);
          }
        }}
        aria-label={`Edit list: ${name}`}
      >
        {name}
      </h2>
      {onDelete && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
          aria-label={`Delete list: ${name}`}
        >
          <span className="material-symbols-outlined text-sm text-red-600">
            delete
          </span>
        </button>
      )}
    </div>
  );
};
