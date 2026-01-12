import { useState, useMemo, useEffect } from 'react';
import { TaskItem } from '../calendar/task-item/TaskItem';
import { PanelModal } from '../shared/PanelModal';
import type { SearchPanelProps } from './SearchPanel.types';

export const SearchPanel = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onViewTask,
  onClose,
}: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    <PanelModal
      onClose={onClose}
      headerContent={
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search todos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            aria-label="Search todos"
          />
        </div>
      }
      footer={
        searchQuery.trim() && searchResults.length > 0 ? (
          <div
            className="text-sm text-gray-600"
            role="status"
            aria-live="polite"
          >
            Found{' '}
            {searchResults.reduce((acc, [, tasks]) => acc + tasks.length, 0)}{' '}
            todo
            {searchResults.reduce((acc, [, tasks]) => acc + tasks.length, 0) !==
            1
              ? 's'
              : ''}{' '}
            across {searchResults.length} date
            {searchResults.length !== 1 ? 's' : ''}
          </div>
        ) : undefined
      }
    >
      <div
        className="h-full overflow-y-auto"
        role="region"
        aria-label="Search results"
      >
        {!searchQuery.trim() ? (
          <div
            className="px-4 py-8 text-center text-gray-400 text-sm"
            role="status"
          >
            Start typing to search todos across all dates
          </div>
        ) : searchResults.length === 0 ? (
          <div
            className="px-4 py-8 text-center text-gray-400 text-sm"
            role="status"
            aria-live="polite"
          >
            No todos found matching "{searchQuery}"
          </div>
        ) : (
          <ul className="list-none p-0 m-0">
            {searchResults.map(([dateString, dateTasks]) => (
              <li
                key={dateString}
                className="border-b border-gray-100 last:border-b-0"
              >
                {/* Date Header */}
                <div className="px-4 py-2 bg-gray-50 sticky top-0">
                  <h3 className="text-sm font-semibold text-gray-600">
                    {formatDate(dateString)}
                  </h3>
                </div>
                {/* Tasks for this date */}
                <ul className="list-none p-0 m-0">
                  {dateTasks.map((task) => (
                    <li key={task.id}>
                      <TaskItem
                        task={task}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                        onView={onViewTask}
                      />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PanelModal>
  );
};
