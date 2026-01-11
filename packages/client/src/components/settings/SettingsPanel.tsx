import { useState } from 'react';
import { PanelModal } from '../shared/PanelModal';
import { KeyboardShortcutsEditor } from './KeyboardShortcutsEditor';
import type { SettingsPanelProps } from './SettingsPanel.types';
import type { UserSettings } from '../../types/settings.types';

export const SettingsPanel = ({
  settings,
  onSave,
  onClose,
}: SettingsPanelProps) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <PanelModal
      title="Settings"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 dark:bg-blue-600 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      }
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Column Width Section */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Column Display
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Column Width (pixels)
                </label>
                <input
                  type="number"
                  min="200"
                  max="800"
                  value={localSettings.columnMinWidth}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      columnMinWidth: parseInt(e.target.value) || 300,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Columns will not shrink below this width
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="todayShowsPrevious"
                  checked={localSettings.todayShowsPrevious}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      todayShowsPrevious: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label
                  htmlFor="todayShowsPrevious"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Show previous day when clicking "Today"
                </label>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Appearance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <div className="flex gap-4">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="radio"
                        name="fontSize"
                        value={size}
                        checked={localSettings.fontSize === size}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            fontSize: e.target.value as
                              | 'small'
                              | 'medium'
                              | 'large',
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Type
                </label>
                <select
                  value={localSettings.fontType}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      fontType: e.target.value as
                        | 'sans'
                        | 'serif'
                        | 'mono'
                        | 'opendyslexic',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="sans">Sans Serif (Default)</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                  <option value="opendyslexic">OpenDyslexic</option>
                </select>
              </div>
            </div>
          </section>

          {/* Navigation Section */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Navigation Controls
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Single Arrow Move (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.singleArrowDays}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      singleArrowDays: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  How many days the single arrow buttons move
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Double Arrow Move (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={localSettings.doubleArrowDays}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      doubleArrowDays: parseInt(e.target.value) || 7,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  How many days the double arrow buttons move
                </p>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts Section */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Keyboard Shortcuts
            </h3>
            <KeyboardShortcutsEditor
              shortcuts={localSettings.keyboardShortcuts}
              onChange={(shortcuts) =>
                setLocalSettings({
                  ...localSettings,
                  keyboardShortcuts: shortcuts,
                })
              }
            />
          </section>

          {/* Auto Column Breakpoints */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Auto Column Breakpoints (pixels)
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Small
                  </label>
                  <input
                    type="number"
                    min="320"
                    value={localSettings.autoColumnBreakpoints.small}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnBreakpoints: {
                          ...localSettings.autoColumnBreakpoints,
                          small: parseInt(e.target.value) || 640,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Medium
                  </label>
                  <input
                    type="number"
                    min="640"
                    value={localSettings.autoColumnBreakpoints.medium}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnBreakpoints: {
                          ...localSettings.autoColumnBreakpoints,
                          medium: parseInt(e.target.value) || 1024,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Large
                  </label>
                  <input
                    type="number"
                    min="1024"
                    value={localSettings.autoColumnBreakpoints.large}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnBreakpoints: {
                          ...localSettings.autoColumnBreakpoints,
                          large: parseInt(e.target.value) || 1536,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Extra Large
                  </label>
                  <input
                    type="number"
                    min="1536"
                    value={localSettings.autoColumnBreakpoints.xlarge}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnBreakpoints: {
                          ...localSettings.autoColumnBreakpoints,
                          xlarge: parseInt(e.target.value) || 2048,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Auto Column Counts */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Default Column Counts
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Small Screens
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.autoColumnCounts.small}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnCounts: {
                          ...localSettings.autoColumnCounts,
                          small: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Medium Screens
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.autoColumnCounts.medium}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnCounts: {
                          ...localSettings.autoColumnCounts,
                          medium: parseInt(e.target.value) || 2,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Large Screens
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.autoColumnCounts.large}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnCounts: {
                          ...localSettings.autoColumnCounts,
                          large: parseInt(e.target.value) || 3,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    XL Screens
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.autoColumnCounts.xlarge}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnCounts: {
                          ...localSettings.autoColumnCounts,
                          xlarge: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    XXL Screens
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.autoColumnCounts.xxlarge}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        autoColumnCounts: {
                          ...localSettings.autoColumnCounts,
                          xxlarge: parseInt(e.target.value) || 7,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PanelModal>
  );
};
