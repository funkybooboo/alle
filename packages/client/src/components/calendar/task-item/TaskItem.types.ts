import type { Task } from '../../../types/task.types';

export interface TaskItemProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string, newTitle: string) => void;
  onView?: (taskId: string) => void;
  className?: string;
}
