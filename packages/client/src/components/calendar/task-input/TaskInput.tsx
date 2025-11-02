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
        className="w-full px-2 py-1 border-b border-gray-200 focus:border-gray-400 focus:outline-none transition-colors placeholder-gray-400"
      />
    </form>
  );
};
