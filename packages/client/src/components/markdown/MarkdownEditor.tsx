import { useState, useRef, useEffect } from 'react';
import MarkdownText from '../shared/MarkdownText';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write in markdown...',
  className = '',
}: MarkdownEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle blur - save changes
  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  // Handle focus - enter edit mode
  const handleFocus = () => {
    setIsEditing(true);
  };

  // Handle value change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  // Render editing mode (side-by-side)
  if (isEditing) {
    return (
      <div className={`flex gap-4 ${className}`}>
        {/* Left: Editor */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            autoFocus
            className="w-full h-full min-h-[300px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 p-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="prose dark:prose-invert max-w-none">
            {localValue ? (
              <MarkdownText>{localValue}</MarkdownText>
            ) : (
              <p className="text-gray-400 italic">Preview will appear here...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render view mode (click to edit)
  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text p-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors min-h-[200px] ${className}`}
    >
      <div className="prose dark:prose-invert max-w-none">
        {value ? (
          <MarkdownText>{value}</MarkdownText>
        ) : (
          <p className="text-gray-400 italic">{placeholder}</p>
        )}
      </div>
    </div>
  );
}
