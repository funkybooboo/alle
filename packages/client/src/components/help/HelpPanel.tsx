import { useEffect } from 'react';

export interface HelpPanelProps {
  onClose: () => void;
}

interface ShortcutSection {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

const shortcuts: ShortcutSection[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'h / ←', description: 'Previous day' },
      { keys: 'l / →', description: 'Next day' },
      { keys: 'H / Shift+←', description: 'Previous week' },
      { keys: 'L / Shift+→', description: 'Next week' },
      { keys: 't', description: 'Go to today' },
      { keys: 'g', description: 'Open calendar picker' },
    ],
  },
  {
    title: 'Views',
    shortcuts: [
      { keys: '/', description: 'Open search' },
      { keys: 'd', description: 'Toggle someday drawer' },
      { keys: 's', description: 'Open settings' },
      { keys: 'Ctrl+K', description: 'Open keyboard shortcuts' },
      { keys: 'Esc', description: 'Close current panel' },
    ],
  },
  {
    title: 'Columns',
    shortcuts: [
      { keys: '-', description: 'Decrease columns' },
      { keys: '+', description: 'Increase columns' },
      { keys: 'a', description: 'Toggle auto mode' },
    ],
  },
  {
    title: 'Tasks',
    shortcuts: [
      { keys: 'n', description: 'New task (in focused column)' },
      { keys: 'Enter', description: 'Save task' },
      { keys: 'Esc', description: 'Cancel editing' },
      { keys: 'Space', description: 'Toggle task completion' },
      { keys: 'Backspace', description: 'Delete task' },
    ],
  },
  {
    title: 'Other',
    shortcuts: [
      { keys: '?', description: 'Show help menu' },
      { keys: 'r', description: 'Open trash' },
    ],
  },
];

export const HelpPanel = ({ onClose }: HelpPanelProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-8">
            {shortcuts.map((section) => (
              <div key={section.title}>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.keys}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.split(' / ').map((key, idx) => (
                          <span key={idx}>
                            {idx > 0 && (
                              <span className="text-gray-400 mx-1">/</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
          Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">Esc</kbd> or{' '}
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">?</kbd> to close
        </div>
      </div>
    </div>
  );
};
