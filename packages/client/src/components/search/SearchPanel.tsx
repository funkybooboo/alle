import { useState, useMemo } from 'react';
import { TaskItem } from '../calendar/task-item/TaskItem';
import type { SearchPanelProps } from './SearchPanel.types';

export const SearchPanel = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onClose,
}: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and group tasks by date
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const filteredTasks = tasks.filter((task) =>
      task.text.toLowerCase().includes(query)
    );

    // Group by date
    const grouped = filteredTasks.reduce(
      (acc, task) => {
        const dateKey = new Date(task.date).toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
      },
      {} as Record<string, typeof tasks>
    );

    // Sort by date (oldest to newest)
    return Object.entries(grouped).sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    );
  }, [tasks, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close search"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search todos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {!searchQuery.trim() ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            Start typing to search todos across all dates
          </div>
        ) : searchResults.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            No todos found matching "{searchQuery}"
          </div>
        ) : (
          <div>
            {searchResults.map(([dateString, dateTasks]) => (
              <div key={dateString} className="border-b border-gray-100 last:border-b-0">
                {/* Date Header */}
                <div className="px-4 py-2 bg-gray-50 sticky top-0">
                  <h3 className="text-sm font-semibold text-gray-600">
                    {formatDate(dateString)}
                  </h3>
                </div>
                {/* Tasks for this date */}
                <div>
                  {dateTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      onEdit={onEditTask}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {searchQuery.trim() && searchResults.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          Found {searchResults.reduce((acc, [, tasks]) => acc + tasks.length, 0)} todo
          {searchResults.reduce((acc, [, tasks]) => acc + tasks.length, 0) !== 1 ? 's' : ''} across{' '}
          {searchResults.length} date{searchResults.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
