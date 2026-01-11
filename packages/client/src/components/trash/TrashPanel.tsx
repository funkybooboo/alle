import { useState } from 'react';
import { MarkdownText } from '../shared/MarkdownText';
import { PanelModal } from '../shared/PanelModal';
import type { TrashItem } from '../../types/trash.types';

export interface TrashPanelProps {
  trash: TrashItem[];
  onRestore: (item: TrashItem) => void;
  onPermanentDelete: (id: number) => void;
  onClose: () => void;
}

export const TrashPanel = ({
  trash,
  onRestore,
  onPermanentDelete,
  onClose,
}: TrashPanelProps) => {
  const [search, setSearch] = useState('');

  const filteredTrash = trash.filter((item) =>
    item.taskText.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  return (
    <PanelModal
      headerContent={
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Trash</h2>
          <span className="text-sm text-gray-500">
            ({filteredTrash.length} item{filteredTrash.length !== 1 ? 's' : ''})
          </span>
        </div>
      }
      onClose={onClose}
      footer={
        <div className="text-sm text-gray-500">
          Items are automatically deleted after 7 days
        </div>
      }
    >
      <div className="h-full flex flex-col">
        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trash..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search trash items"
          />
        </div>

        {/* Trash Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTrash.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span
                className="material-symbols-outlined text-6xl mb-2"
                aria-hidden="true"
              >
                delete
              </span>
              <p className="text-lg">
                {search ? 'No matching items' : 'Trash is empty'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTrash.map((item) => (
                <div
                  key={item.id}
                  className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800">
                        <MarkdownText>{item.taskText}</MarkdownText>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            item.taskType === 'calendar'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {item.taskType === 'calendar'
                            ? 'Calendar'
                            : 'Someday'}
                        </span>
                        <span>•</span>
                        <span>Deleted {formatDate(item.deletedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onRestore(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Restore"
                      >
                        <span
                          className="material-symbols-outlined text-lg"
                          aria-hidden="true"
                        >
                          restore
                        </span>
                      </button>
                      <button
                        onClick={() => onPermanentDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete permanently"
                      >
                        <span
                          className="material-symbols-outlined text-lg"
                          aria-hidden="true"
                        >
                          delete_forever
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PanelModal>
  );
};
