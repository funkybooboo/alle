import React from 'react';
import styles from './NavbarIcon.module.css';

interface NavbarIconProps {
  iconName: string;
  isOpen: boolean;
  handleClick: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  'data-testid'?: string;
  title?: string;
}

export const NavbarIcon = ({
  iconName,
  isOpen,
  handleClick,
  handleKeyDown,
  'data-testid': dataTestId,
  title,
}: NavbarIconProps) => {
  return (
    <button
      type="button"
      data-testid={dataTestId}
      aria-label={title || iconName}
      aria-expanded={isOpen}
      aria-controls="search-panel"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={title}
      className={`p-2 rounded-full flex items-center justify-center ${styles.iconButton}`}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {iconName}
      </span>
    </button>
  );
};
