import { useState } from 'react';
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
    <div className="h-full flex flex-col bg-white">
      {/* Settings Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close settings"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Column Width Section */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Column Display
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="todayShowsPrevious"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Show previous day when clicking "Today"
                </label>
              </div>
            </div>
          </section>

          {/* Navigation Section */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Navigation Controls
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  How many days the single arrow buttons move
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  How many days the double arrow buttons move
                </p>
              </div>
            </div>
          </section>

          {/* Auto Column Breakpoints */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Auto Column Breakpoints (pixels)
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Auto Column Counts */}
          <section>
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Default Column Counts
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
