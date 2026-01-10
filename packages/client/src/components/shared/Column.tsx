import { ReactNode } from 'react';

export interface ColumnProps<T> {
  header: ReactNode;
  tasks: T[];
  TaskItemComponent: React.ComponentType<{
    task: T;
    onToggle?: (id: any) => void;
    onDelete?: (id: any) => void;
    onEdit?: (id: any, ...args: any[]) => void;
  }>;
  TaskInputComponent: React.ComponentType<{
    onAdd: (text: string) => void;
    placeholder?: string;
  }>;
  onToggleTask?: (id: any) => void;
  onDeleteTask?: (id: any) => void;
  onEditTask?: (id: any, ...args: any[]) => void;
  onAddTask?: (text: string) => void;
  inputPlaceholder?: string;
  isHighlighted?: boolean;
  className?: string;
}

export function Column<T>({
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
}: ColumnProps<T>) {
  return (
    <div
      className={`flex flex-col border-r border-gray-200 ${
        isHighlighted ? 'bg-blue-50' : 'bg-white'
      } ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-1.5 border-b border-gray-200 bg-gray-50">
        {header}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <div>
          {tasks.map((task: any) => (
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
