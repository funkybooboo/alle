import { useMemo } from 'react';
import { DayColumn } from '../day-column/DayColumn';
import type { CalendarViewProps } from './CalendarView.types';

export const CalendarView = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  startDate = new Date(),
  numDays = 7,
  columnMinWidth = 300,
  className = '',
}: CalendarViewProps) => {
  // Generate array of dates starting from startDate
  const dates = useMemo(() => {
    const result: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    for (let i = 0; i < numDays; i++) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [startDate, numDays]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, typeof tasks>();

    tasks.forEach((task) => {
      const dateKey = new Date(task.date).toDateString();
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, task]);
    });

    return grouped;
  }, [tasks]);

  return (
    <div
      data-testid="calendar-view"
      className={`grid h-full w-full overflow-x-auto ${className}`}
      style={{
        gridTemplateColumns: `repeat(${numDays}, minmax(${columnMinWidth}px, 1fr))`,
      }}
    >
      {dates.map((date) => {
        const dateKey = date.toDateString();
        const dayTasks = tasksByDate.get(dateKey) || [];

        return (
          <DayColumn
            key={dateKey}
            date={date}
            tasks={dayTasks}
            onAddTask={(text) => onAddTask?.(date, text)}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
          />
        );
      })}
    </div>
  );
};
