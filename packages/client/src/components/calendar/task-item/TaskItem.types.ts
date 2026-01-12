export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
}

export interface TaskItemProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string, newText: string) => void;
  onView?: (taskId: string) => void;
  className?: string;
}
