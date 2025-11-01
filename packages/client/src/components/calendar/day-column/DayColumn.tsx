import { TaskItem } from '../task-item/TaskItem';
import { TaskInput } from '../task-input/TaskInput';
import type { DayColumnProps } from './DayColumn.types';

export const DayColumn = ({
  date,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  className = '',
}: DayColumnProps) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Format as day of week and date
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${dayOfWeek}, ${monthDay}`;
  };

  return (
    <div
      className={`flex flex-col min-w-[300px] border-r border-gray-200 bg-white ${className}`}
    >
      {/* Day Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {formatDate(date)}
        </h2>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            No tasks yet
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Input */}
      <div className="border-t border-gray-200">
        <TaskInput
          onAdd={(text) => onAddTask?.(text)}
          placeholder="Add a task..."
        />
      </div>
    </div>
  );
};
