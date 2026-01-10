import { EditableTaskItem } from '../../shared/EditableTaskItem';
import type { TaskItemProps } from './TaskItem.types';

export const TaskItem = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  className = '',
}: TaskItemProps) => {
  return (
    <EditableTaskItem
      id={task.id}
      text={task.text}
      completed={task.completed}
      onToggle={() => onToggle?.(task.id)}
      onDelete={() => onDelete?.(task.id)}
      onEdit={(newText) => onEdit?.(task.id, newText)}
      className={className}
      testId="task-item"
    />
  );
};
