import { useState } from 'react';
import { taskLinkAPI } from '../../api/task-link-api';
import type { TaskLink } from '../../types/task.types';

interface LinksManagerProps {
  taskId: number;
  links: TaskLink[];
  onLinksChange: (links: TaskLink[]) => void;
  className?: string;
}

export default function LinksManager({
  taskId,
  links,
  onLinksChange,
  className = '',
}: LinksManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');

  // Add a new link
  const handleAddLink = async () => {
    if (!newUrl.trim()) return;

    try {
      const link = await taskLinkAPI.addTaskLink({
        taskId,
        url: newUrl.trim(),
        title: newTitle.trim() || null,
      });
      onLinksChange([...links, link]);
      setNewUrl('');
      setNewTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add link:', err);
    }
  };

  // Start editing a link
  const startEditing = (link: TaskLink) => {
    setEditingId(link.id);
    setEditUrl(link.url);
    setEditTitle(link.title || '');
  };

  // Save edited link
  const handleSaveEdit = async (linkId: number) => {
    try {
      const updatedLink = await taskLinkAPI.updateTaskLink({
        id: linkId,
        url: editUrl.trim(),
        title: editTitle.trim() || null,
      });
      onLinksChange(links.map((l) => (l.id === linkId ? updatedLink : l)));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update link:', err);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditUrl('');
    setEditTitle('');
  };

  // Delete a link
  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      await taskLinkAPI.deleteTaskLink(linkId);
      onLinksChange(links.filter((l) => l.id !== linkId));
    } catch (err) {
      console.error('Failed to delete link:', err);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Existing links */}
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <div
            key={link.id}
            className="p-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded"
          >
            {editingId === link.id ? (
              // Edit mode
              <div className="flex flex-col gap-2">
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Link title (optional)"
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(link.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline block truncate"
                  >
                    {link.title || link.url}
                  </a>
                  {link.title && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {link.url}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEditing(link)}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm px-2 py-1"
                    title="Edit link"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm px-2 py-1"
                    title="Delete link"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {links.length === 0 && !isAdding && (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
            No links yet
          </p>
        )}
      </div>

      {/* Add link form */}
      {isAdding ? (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded">
          <div className="flex flex-col gap-2">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              placeholder="https://example.com"
              autoFocus
              className="px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              placeholder="Link title (optional)"
              className="px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddLink}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Add Link
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewUrl('');
                  setNewTitle('');
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="self-start px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          + Add Link
        </button>
      )}
    </div>
  );
}
