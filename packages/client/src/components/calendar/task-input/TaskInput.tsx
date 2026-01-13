import { useState } from 'react';
import type { TaskInputProps } from './TaskInput.types';

export const TaskInput = ({
  onAdd,
  placeholder = 'Add a task...',
  className = '',
}: TaskInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`px-3 py-2 ${className}`}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-2 py-1 border-b border-gray-200 dark:border-[#2a2a2a] focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-600 text-sm bg-transparent text-gray-900 dark:text-white"
        aria-label={placeholder}
      />
    </form>
  );
};
