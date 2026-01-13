import { IconButton } from '../shared/IconButton';
import type { ColumnControlsProps } from './ColumnControls.types';

export const ColumnControls = ({
  numDays,
  isAutoMode,
  theme,
  onDecrease,
  onIncrease,
  onToggleAuto,
  onToggleTheme,
  onOpenSettings,
  onOpenHelp,
  onOpenTrash,
}: ColumnControlsProps) => {
  return (
    <div className="h-10 border-t border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-between px-4">
      {/* Settings and theme buttons on the left */}
      <div className="flex items-center gap-2">
        <IconButton
          icon="settings"
          onClick={onOpenSettings}
          label="Settings (Alt+,)"
        />
        <IconButton
          icon={theme === 'LIGHT' ? 'light_mode' : 'dark_mode'}
          onClick={onToggleTheme}
          label={
            theme === 'LIGHT'
              ? 'Switch to dark mode (Alt+Shift+D)'
              : 'Switch to light mode (Alt+Shift+D)'
          }
        />
      </div>

      {/* Column controls in the center */}
      <div className="flex items-center gap-2">
        <IconButton
          icon="remove"
          onClick={onDecrease}
          disabled={numDays <= 1}
          label="Decrease columns ([)"
        />

        <span className="text-sm text-gray-700 dark:text-white font-medium min-w-[80px] text-center">
          {numDays} {numDays === 1 ? 'column' : 'columns'}
        </span>

        <IconButton icon="add" onClick={onIncrease} label="Increase columns (])" />

        <button
          onClick={onToggleAuto}
          className={`ml-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
            isAutoMode
              ? 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
              : 'bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3a3a3a] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#3a3a3a]'
          }`}
          aria-label={
            isAutoMode ? 'Auto mode enabled (Alt+A)' : 'Enable auto mode (Alt+A)'
          }
          aria-pressed={isAutoMode}
          title={isAutoMode ? 'Auto mode enabled (Alt+A)' : 'Enable auto mode (Alt+A)'}
        >
          Auto
        </button>
      </div>

      {/* Help and Trash buttons on the right */}
      <div className="flex items-center gap-2">
        <IconButton icon="help" onClick={onOpenHelp} label="Help (?)" />
        <IconButton icon="delete" onClick={onOpenTrash} label="Trash (Alt+T)" />
      </div>
    </div>
  );
};
