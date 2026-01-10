import { useMemo } from 'react';
import { SomedayTaskItem } from './SomedayTaskItem';
import { EditableHeader } from '../shared/EditableHeader';
import { TaskInput } from '../calendar/task-input/TaskInput';
import { Column } from '../shared/Column';
import type { SomedayList, SomedayTask } from '../../types/someday.types';

export interface SomedayListColumnProps {
  list: SomedayList;
  tasks: SomedayTask[];
  onAddTask?: (listId: number, title: string, description?: string) => void;
  onToggleTask?: (id: number) => void;
  onDeleteTask?: (id: number) => void;
  onEditTask?: (id: number, title: string, description?: string) => void;
  onEditList?: (id: number, name: string) => void;
  onDeleteList?: (id: number) => void;
  className?: string;
}

export const SomedayListColumn = ({
  list,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onEditList,
  onDeleteList,
  className = '',
}: SomedayListColumnProps) => {
  // Sort tasks by position
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.position - b.position);
  }, [tasks]);

  const header = (
    <EditableHeader
      name={list.name}
      onEdit={(name) => onEditList?.(list.id, name)}
      onDelete={() => onDeleteList?.(list.id)}
    />
  );

  return (
    <Column
      header={header}
      tasks={sortedTasks}
      TaskItemComponent={SomedayTaskItem}
      TaskInputComponent={TaskInput}
      onToggleTask={onToggleTask}
      onDeleteTask={onDeleteTask}
      onEditTask={onEditTask}
      onAddTask={(text) => onAddTask?.(list.id, text, undefined)}
      inputPlaceholder="Add a task..."
      className={className}
    />
  );
};
