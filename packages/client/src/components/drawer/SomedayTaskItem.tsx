import { EditableTaskItem } from '../shared/EditableTaskItem';
import type { SomedayTask } from '../../types/someday.types';

export interface SomedayTaskItemProps {
  task: SomedayTask;
  onToggle?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, title: string, description?: string) => void;
}

export const SomedayTaskItem = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}: SomedayTaskItemProps) => {
  return (
    <EditableTaskItem
      id={task.id}
      text={task.title}
      completed={task.completed}
      onToggle={() => onToggle?.(task.id)}
      onDelete={() => onDelete?.(task.id)}
      onEdit={(newText) => onEdit?.(task.id, newText)}
    />
  );
};
