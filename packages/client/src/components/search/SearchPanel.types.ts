import type { Task } from '../calendar/task-item/TaskItem.types';

export interface SearchPanelProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newText: string) => void;
  onViewTask?: (taskId: string) => void;
  onClose: () => void;
}
