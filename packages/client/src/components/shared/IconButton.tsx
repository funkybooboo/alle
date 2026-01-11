import React from 'react';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label?: string;
  toggled?: boolean;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
}

export const IconButton = ({
  icon,
  label,
  toggled = false,
  size = 'medium',
  className = '',
  onClick,
  ...props
}: IconButtonProps) => {
  const sizeClasses = {
    xsmall: 'p-0.5',
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-3',
  };

  const iconSizeClasses = {
    xsmall: 'text-sm',
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <button
      type="button"
      className={`${sizeClasses[size]} rounded flex items-center justify-center transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 ${
        toggled
          ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-gray-300'
          : 'text-gray-600 dark:text-gray-300 bg-transparent'
      } ${className}`}
      onClick={onClick}
      aria-label={label || icon}
      aria-pressed={toggled}
      title={label}
      {...props}
    >
      <span
        className={`material-symbols-outlined ${iconSizeClasses[size]}`}
        aria-hidden="true"
      >
        {icon}
      </span>
    </button>
  );
};
