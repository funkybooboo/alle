import { useEffect } from 'react';
import { PanelModal } from '../shared/PanelModal';

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
      { keys: '← / ArrowLeft', description: 'Previous day' },
      { keys: '→ / ArrowRight', description: 'Next day' },
      { keys: 'Shift+← / Shift+ArrowLeft', description: 'Previous week' },
      { keys: 'Shift+→ / Shift+ArrowRight', description: 'Next week' },
      { keys: 'Home', description: 'Go to today' },
    ],
  },
  {
    title: 'Panels',
    shortcuts: [
      { keys: ',', description: 'Toggle search' },
      { keys: 'Alt+,', description: 'Toggle settings' },
      { keys: 'Alt+T', description: 'Toggle trash' },
      { keys: 'Alt+C', description: 'Toggle calendar picker' },
      { keys: '?', description: 'Toggle keyboard shortcuts' },
      { keys: 'Esc', description: 'Close current panel' },
    ],
  },
  {
    title: 'View Controls',
    shortcuts: [
      { keys: '[', description: 'Decrease columns' },
      { keys: ']', description: 'Increase columns' },
      { keys: 'Alt+A', description: 'Toggle auto column mode' },
      { keys: 'Alt+Shift+D', description: 'Toggle dark mode' },
    ],
  },
  {
    title: 'Task Editing',
    shortcuts: [
      { keys: 'Enter', description: 'Save task' },
      { keys: 'Esc', description: 'Cancel editing' },
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
    <PanelModal
      title="Keyboard Shortcuts"
      onClose={onClose}
      footer={
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Press{' '}
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
            ?
          </kbd>{' '}
          or{' '}
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
            Esc
          </kbd>{' '}
          to close
        </p>
      }
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-8">
          {shortcuts.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.split(' / ').map((key, idx) => (
                        <span key={idx}>
                          {idx > 0 && (
                            <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
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
    </PanelModal>
  );
};
