import { useState, useMemo } from 'react';
import { DrawerHandle } from './DrawerHandle';
import { SomedayListColumn } from './SomedayListColumn';
import type { SomedayList, SomedayTask } from '../../types/someday.types';

export interface SomedayDrawerProps {
  lists: SomedayList[];
  tasks: SomedayTask[];
  height: number;
  isOpen: boolean;
  onHeightChange?: (height: number) => void;
  onToggle?: () => void;
  onAddList?: (name: string) => void;
  onEditList?: (id: number, name: string) => void;
  onDeleteList?: (id: number) => void;
  onAddTask?: (listId: number, title: string, description?: string) => void;
  onToggleTask?: (id: number) => void;
  onDeleteTask?: (id: number) => void;
  onEditTask?: (id: number, title: string, description?: string) => void;
}

export const SomedayDrawer = ({
  lists,
  tasks,
  height,
  isOpen,
  onHeightChange,
  onToggle,
  onAddList,
  onEditList,
  onDeleteList,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
}: SomedayDrawerProps) => {
  const [newListName, setNewListName] = useState('');
  const [showAddList, setShowAddList] = useState(false);

  const handleDrag = (deltaY: number) => {
    const newHeight = Math.max(100, Math.min(height + deltaY, window.innerHeight - 200));
    onHeightChange?.(newHeight);
  };

  const handleAddList = () => {
    if (newListName.trim()) {
      const nextPosition = lists.length > 0
        ? Math.max(...lists.map(l => l.position)) + 1
        : 0;
      onAddList?.(newListName.trim());
      setNewListName('');
      setShowAddList(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddList();
    } else if (e.key === 'Escape') {
      setShowAddList(false);
      setNewListName('');
    }
  };

  // Group tasks by list
  const tasksByList = useMemo(() => {
    const grouped = new Map<number, SomedayTask[]>();
    tasks.forEach((task) => {
      const existing = grouped.get(task.listId) || [];
      grouped.set(task.listId, [...existing, task]);
    });
    return grouped;
  }, [tasks]);

  // Sort lists by position
  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => a.position - b.position);
  }, [lists]);

  const drawerHeight = isOpen ? height : 0;
  const numLists = sortedLists.length;

  return (
    <div
      className="flex-shrink-0 border-t border-gray-300 bg-white transition-all duration-300 ease-in-out overflow-hidden"
      style={{ height: `${drawerHeight}px` }}
    >
      <DrawerHandle
        onDrag={handleDrag}
        onToggle={() => onToggle?.()}
        isOpen={isOpen}
      />

      {isOpen && (
        <div className="h-full overflow-hidden" style={{ height: `${height - 32}px` }}>
          {/* Lists */}
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: numLists > 0 ? `repeat(${numLists}, 1fr) 40px` : '1fr 40px',
            }}
          >
            {sortedLists.map((list) => (
              <SomedayListColumn
                key={list.id}
                list={list}
                tasks={tasksByList.get(list.id) || []}
                onAddTask={onAddTask}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onEditList={onEditList}
                onDeleteList={onDeleteList}
              />
            ))}

            {/* Add list column */}
            {showAddList ? (
              <div className="bg-gray-50 border-l border-gray-300 p-2 flex items-start justify-center">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAddList}
                  placeholder="New list"
                  className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <div className="bg-gray-50 border-l border-gray-300">
                <button
                  onClick={() => setShowAddList(true)}
                  className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
