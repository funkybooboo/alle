import type { Task } from '../task-item/TaskItem.types';

export interface DayColumnProps {
  date: Date;
  tasks: Task[];
  onAddTask?: (text: string) => void;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string, newText: string) => void;
  className?: string;
}
