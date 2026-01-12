import { TaskItem } from '../task-item/TaskItem';
import { TaskInput } from '../task-input/TaskInput';
import { Column } from '../../shared/Column';
import type { DayColumnProps } from './DayColumn.types';

export const DayColumn = ({
  date,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onViewTask,
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

  const header = (
    <h2
      className={`text-sm font-semibold ${
        isToday ? 'text-blue-600' : 'text-gray-800'
      }`}
      data-testid="day-header"
    >
      {formatDate(date)}
    </h2>
  );

  return (
    <div data-testid="day-column" className={className}>
      <Column
        header={header}
        tasks={tasks}
        TaskItemComponent={TaskItem}
        TaskInputComponent={TaskInput}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
        onViewTask={onViewTask}
        onAddTask={onAddTask}
        inputPlaceholder="Add a task..."
        isHighlighted={false}
      />
    </div>
  );
};
