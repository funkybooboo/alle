import { useState, useEffect } from 'react';
import { presetAPI } from '../../api/preset-api';
import type { ColorPreset } from '../../types/task.types';

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
  className?: string;
}

export default function ColorPicker({
  value,
  onChange,
  className = '',
}: ColorPickerProps) {
  const [presets, setPresets] = useState<ColorPreset[]>([]);
  const [customColor, setCustomColor] = useState(value || '#3B82F6');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load color presets
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await presetAPI.getColorPresets();
        setPresets(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load color presets:', err);
        setLoading(false);
      }
    };
    loadPresets();
  }, []);

  // Handle preset selection
  const handleSelectPreset = (hexValue: string) => {
    onChange(hexValue);
    setShowCustomInput(false);
  };

  // Handle custom color
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  // Handle clear color
  const handleClear = () => {
    onChange(null);
    setShowCustomInput(false);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Task Color
        </h4>
        {value && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          >
            Clear
          </button>
        )}
      </div>

      {/* Color Presets */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading colors...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.hexValue)}
              className={`w-10 h-10 rounded border-2 transition-all hover:scale-110 ${
                value === preset.hexValue
                  ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ backgroundColor: preset.hexValue }}
              title={preset.name}
            />
          ))}

          {/* Custom color button */}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`w-10 h-10 rounded border-2 flex items-center justify-center transition-all hover:scale-110 ${
              showCustomInput
                ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                : 'border-gray-300 dark:border-gray-600'
            } bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500`}
            title="Custom color"
          >
            <span className="text-white text-xs font-bold">+</span>
          </button>
        </div>
      )}

      {/* Custom color input */}
      {showCustomInput && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-12 h-12 rounded cursor-pointer"
          />
          <div className="flex-1">
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onChange(e.target.value);
                }
              }}
              placeholder="#3B82F6"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter hex color code</p>
          </div>
        </div>
      )}

      {/* Current selection */}
      {value && !showCustomInput && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div
            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}
