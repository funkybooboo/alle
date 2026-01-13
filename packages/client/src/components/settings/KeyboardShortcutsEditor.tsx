import { useState } from 'react';
import type { KeyboardShortcuts } from '../../types/settings.types';
import { formatShortcut, isValidShortcut } from '../../utils/keyboard';

export interface KeyboardShortcutsEditorProps {
  shortcuts: KeyboardShortcuts;
  onChange: (shortcuts: KeyboardShortcuts) => void;
}

interface ShortcutConfig {
  key: keyof KeyboardShortcuts;
  label: string;
  category: string;
}

const SHORTCUT_CONFIGS: ShortcutConfig[] = [
  // Navigation
  { key: 'navigatePrevDay', label: 'Previous day', category: 'Navigation' },
  { key: 'navigateNextDay', label: 'Next day', category: 'Navigation' },
  { key: 'navigatePrevWeek', label: 'Previous week', category: 'Navigation' },
  { key: 'navigateNextWeek', label: 'Next week', category: 'Navigation' },
  { key: 'navigateToday', label: 'Go to today', category: 'Navigation' },
  // Panels
  { key: 'toggleSearch', label: 'Toggle search', category: 'Panels' },
  { key: 'toggleSettings', label: 'Toggle settings', category: 'Panels' },
  { key: 'toggleTrash', label: 'Toggle trash', category: 'Panels' },
  { key: 'toggleCalendar', label: 'Toggle calendar', category: 'Panels' },
  { key: 'toggleHelp', label: 'Toggle help', category: 'Panels' },
  { key: 'closePanel', label: 'Close panel', category: 'Panels' },
  // View Controls
  {
    key: 'decreaseColumns',
    label: 'Decrease columns',
    category: 'View Controls',
  },
  {
    key: 'increaseColumns',
    label: 'Increase columns',
    category: 'View Controls',
  },
  {
    key: 'toggleAutoMode',
    label: 'Toggle auto mode',
    category: 'View Controls',
  },
  { key: 'toggleTheme', label: 'Toggle dark mode', category: 'View Controls' },
];

export const KeyboardShortcutsEditor = ({
  shortcuts,
  onChange,
}: KeyboardShortcutsEditorProps) => {
  const [editingKey, setEditingKey] = useState<keyof KeyboardShortcuts | null>(
    null
  );
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const handleEdit = (key: keyof KeyboardShortcuts) => {
    setEditingKey(key);
    setEditValue(shortcuts[key]);
    setError('');
  };

  const handleSave = () => {
    if (!editingKey) return;

    if (!isValidShortcut(editValue)) {
      setError('Invalid shortcut format');
      return;
    }

    onChange({
      ...shortcuts,
      [editingKey]: editValue,
    });

    setEditingKey(null);
    setEditValue('');
    setError('');
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const groupedShortcuts = SHORTCUT_CONFIGS.reduce(
    (acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    },
    {} as Record<string, ShortcutConfig[]>
  );

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Click on a shortcut to edit it. Press Enter to save or Escape to cancel.
      </div>

      {Object.entries(groupedShortcuts).map(([category, configs]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {category}
          </h4>
          <div className="space-y-2">
            {configs.map((config) => (
              <div
                key={config.key}
                className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {config.label}
                </span>
                {editingKey === config.key ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Alt+Shift+D"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(config.key)}
                    className="px-3 py-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {formatShortcut(shortcuts[config.key])}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
    </div>
  );
};
