import type { ReactNode } from 'react';

export interface ColumnProps<
  T extends { id: string | number },
  EditArgs extends unknown[] = [string],
> {
  header: ReactNode;
  tasks: T[];
  TaskItemComponent: React.ComponentType<{
    task: T;
    onToggle?: (id: T['id']) => void;
    onDelete?: (id: T['id']) => void;
    onEdit?: (id: T['id'], ...args: EditArgs) => void;
  }>;
  TaskInputComponent: React.ComponentType<{
    onAdd: (text: string) => void;
    placeholder?: string;
  }>;
  onToggleTask?: (id: T['id']) => void;
  onDeleteTask?: (id: T['id']) => void;
  onEditTask?: (id: T['id'], ...args: EditArgs) => void;
  onAddTask?: (text: string) => void;
  inputPlaceholder?: string;
  isHighlighted?: boolean;
  className?: string;
}

export function Column<
  T extends { id: string | number },
  EditArgs extends unknown[] = [string],
>({
  header,
  tasks,
  TaskItemComponent,
  TaskInputComponent,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onAddTask,
  inputPlaceholder = 'Add a task...',
  isHighlighted = false,
  className = '',
}: ColumnProps<T, EditArgs>) {
  return (
    <div
      className={`flex flex-col border-r border-gray-200 dark:border-gray-700 ${
        isHighlighted
          ? 'bg-blue-50 dark:bg-gray-800'
          : 'bg-white dark:bg-gray-900'
      } ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {header}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <div>
          {tasks.map((task) => (
            <TaskItemComponent
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
          {/* Task Input - inline with tasks */}
          <TaskInputComponent
            onAdd={(text) => onAddTask?.(text)}
            placeholder={inputPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}
