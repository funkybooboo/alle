import { useMemo } from 'react';
import { DayColumn } from '../day-column/DayColumn';
import type { CalendarViewProps } from './CalendarView.types';

export interface CalendarViewPropsExtended extends CalendarViewProps {
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}

export const CalendarView = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  startDate = new Date(),
  numDays = 7,
  columnMinWidth = 300,
  onNavigatePrev,
  onNavigateNext,
  className = '',
}: CalendarViewPropsExtended) => {
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
    <div data-testid="calendar-view" className={`relative h-full w-full ${className}`}>
      {/* Left arrow overlay */}
      <button
        onClick={onNavigatePrev}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-50/50 transition-all z-10 opacity-0 hover:opacity-100"
      >
        <span className="material-symbols-outlined text-xl">chevron_left</span>
      </button>

      {/* Right arrow overlay */}
      <button
        onClick={onNavigateNext}
        className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-50/50 transition-all z-10 opacity-0 hover:opacity-100"
      >
        <span className="material-symbols-outlined text-xl">chevron_right</span>
      </button>

      {/* Calendar grid */}
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${numDays}, 1fr)`,
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
    </div>
  );
};
