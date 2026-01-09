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
    // Format as day of week and date
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${dayOfWeek}, ${monthDay}`;
  };

  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div
      data-testid="day-column"
      className={`flex flex-col border-r border-gray-200 ${
        isToday ? 'bg-blue-50' : 'bg-white'
      } ${className}`}
    >
      {/* Day Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2
          className="text-lg font-semibold text-gray-800"
          data-testid="day-header"
        >
          {formatDate(date)}
        </h2>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
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
          {/* Task Input - inline with tasks */}
          <TaskInput
            onAdd={(text) => onAddTask?.(text)}
            placeholder="Add a task..."
          />
        </div>
      </div>
    </div>
  );
};
