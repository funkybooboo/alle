import { EditableTaskItem } from '../../shared/EditableTaskItem';
import type { TaskItemProps } from './TaskItem.types';

export const TaskItem = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  onView,
  className = '',
}: TaskItemProps) => {
  return (
    <EditableTaskItem
      id={task.id}
      text={task.title}
      completed={task.completed}
      onToggle={() => onToggle?.(task.id)}
      onDelete={() => onDelete?.(task.id)}
      onEdit={(newTitle) => onEdit?.(task.id, newTitle)}
      onView={onView ? () => onView(task.id) : undefined}
      className={className}
      testId="task-item"
    />
  );
};
