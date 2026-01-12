import type { Task } from '../task-item/TaskItem.types';

export interface CalendarViewProps {
  tasks: Task[];
  onAddTask?: (date: Date, text: string) => void;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string, newText: string) => void;
  onViewTask?: (taskId: string) => void;
  startDate?: Date;
  numDays?: number;
  columnMinWidth?: number;
  className?: string;
}
