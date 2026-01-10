import type { ColumnControlsProps } from './ColumnControls.types';

export const ColumnControls = ({
  numDays,
  isAutoMode,
  onDecrease,
  onIncrease,
  onToggleAuto,
  onOpenSettings,
  onOpenHelp,
  onOpenTrash,
}: ColumnControlsProps) => {
  return (
    <div className="h-10 border-t border-gray-200 bg-gray-50 flex items-center justify-between px-4">
      {/* Settings button on the left */}
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-200 transition-colors text-gray-700"
        aria-label="Open settings"
      >
        <span className="material-symbols-outlined text-sm">settings</span>
        <span className="text-sm font-medium">Settings</span>
      </button>

      {/* Column controls in the center */}
      <div className="flex items-center gap-2">
      <button
        onClick={onDecrease}
        disabled={numDays <= 1}
        className="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease columns"
      >
        <span className="material-symbols-outlined text-sm">remove</span>
      </button>

      <span className="text-sm text-gray-700 font-medium min-w-[80px] text-center">
        {numDays} {numDays === 1 ? 'column' : 'columns'}
      </span>

      <button
        onClick={onIncrease}
        className="px-3 py-1 rounded hover:bg-gray-200 transition-colors"
        aria-label="Increase columns"
      >
        <span className="material-symbols-outlined text-sm">add</span>
      </button>

      <button
        onClick={onToggleAuto}
        className={`ml-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
          isAutoMode
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        aria-label={isAutoMode ? 'Auto mode enabled' : 'Enable auto mode'}
      >
        Auto
      </button>
      </div>

      {/* Help and Trash buttons on the right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-200 transition-colors text-gray-700"
          aria-label="Help"
          title="Help (Ctrl+K)"
        >
          <span className="material-symbols-outlined text-sm">help</span>
        </button>
        <button
          onClick={onOpenTrash}
          className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-200 transition-colors text-gray-700"
          aria-label="Trash"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
};
