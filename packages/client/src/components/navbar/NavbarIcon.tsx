import React from 'react';
import styles from './NavbarIcon.module.css';

interface NavbarIconProps {
  iconName: string;
  isOpen: boolean;
  handleClick: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

export const NavbarIcon = ({
  iconName,
  isOpen,
  handleClick,
  handleKeyDown,
}: NavbarIconProps) => {
  return (
    <button
      type="button"
      aria-label={iconName}
      aria-expanded={isOpen}
      aria-controls="search-panel"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`p-2 rounded-full flex items-center justify-center ${styles.iconButton}`}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {iconName}
      </span>
    </button>
  );
};
