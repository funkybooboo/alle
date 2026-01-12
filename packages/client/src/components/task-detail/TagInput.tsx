import { useState, useEffect, useRef } from 'react';
import { taskTagAPI } from '../../api/task-tag-api';
import type { TaskTag } from '../../types/task.types';

interface TagInputProps {
  taskId: number;
  tags: TaskTag[];
  onTagsChange: (tags: TaskTag[]) => void;
  className?: string;
}

export default function TagInput({
  taskId,
  tags,
  onTagsChange,
  className = '',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allTagNames, setAllTagNames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all existing tag names for suggestions
  useEffect(() => {
    const loadTagNames = async () => {
      try {
        const names = await taskTagAPI.getAllTagNames();
        setAllTagNames(names);
      } catch (err) {
        console.error('Failed to load tag names:', err);
      }
    };
    loadTagNames();
  }, []);

  // Update suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allTagNames
        .filter(
          (name) =>
            name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.some((tag) => tag.tagName === name)
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [inputValue, allTagNames, tags]);

  // Add a tag
  const addTag = async (tagName: string) => {
    const trimmedName = tagName.trim();
    if (!trimmedName) return;

    // Check if tag already exists
    if (tags.some((tag) => tag.tagName === trimmedName)) {
      return;
    }

    try {
      const newTag = await taskTagAPI.addTaskTag({
        taskId,
        tagName: trimmedName,
      });
      onTagsChange([...tags, newTag]);
      setInputValue('');
      setShowSuggestions(false);

      // Refresh all tag names to include the new one
      const names = await taskTagAPI.getAllTagNames();
      setAllTagNames(names);
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };

  // Remove a tag
  const removeTag = async (tagId: number) => {
    try {
      await taskTagAPI.deleteTaskTag(tagId);
      onTagsChange(tags.filter((tag) => tag.id !== tagId));
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        addTag(suggestions[selectedIndex]);
      } else {
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Existing tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
          >
            {tag.tagName}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
              title="Remove tag"
            >
              ×
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
            No tags yet
          </p>
        )}
      </div>

      {/* Tag input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Add a tag..."
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900'
                    : ''
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Press Enter to add a tag. Type to see suggestions from existing tags.
      </p>
    </div>
  );
}
