import { useState } from 'react';
import { NavbarIcon } from './NavbarIcon';
import type { NavbarProps } from './Navbar.types';
import styles from './Navbar.module.css';
import '../../utils.css';

export const Navbar = ({
  currentDate = new Date(),
  onNavigateToday,
  onNavigatePrevDay,
  onNavigateNextDay,
  onNavigatePrevWeek,
  onNavigateNextWeek,
  onSearchToggle,
  className = '',
}: NavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    onSearchToggle?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isSearchOpen) {
      setIsSearchOpen(false);
    }
  };

  const formatCurrentDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);

    if (current.getTime() === today.getTime()) {
      return 'Today';
    }

    return currentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        currentDate.getFullYear() !== today.getFullYear()
          ? 'numeric'
          : undefined,
    });
  };

  return (
    <nav
      className={`w-full flex sticky items-center gap-4 px-4 py-2 flex-row justify-between h-14 md:h-18 lg:h-22 ${styles.navbar} ${className}`}
    >
      <div className="flex flex-row items-center gap-4">
        <NavbarIcon
          iconName="search"
          isOpen={isSearchOpen}
          handleClick={handleSearchToggle}
          handleKeyDown={handleKeyDown}
        />
        <div className={`md:hidden ${styles.today}`}>{formatCurrentDate()}</div>
        <h1 className={`hidden md:block ${styles.title}`}>Alle</h1>
      </div>

      <div className="flex flex-row gap-1">
        <NavbarIcon
          iconName="keyboard_double_arrow_left"
          isOpen={false}
          handleClick={() => onNavigatePrevWeek?.()}
          handleKeyDown={() => {}}
        />
        <NavbarIcon
          iconName="keyboard_arrow_left"
          isOpen={false}
          handleClick={() => onNavigatePrevDay?.()}
          handleKeyDown={() => {}}
        />
        <NavbarIcon
          iconName="calendar_today"
          isOpen={false}
          handleClick={() => onNavigateToday?.()}
          handleKeyDown={() => {}}
        />
        <NavbarIcon
          iconName="keyboard_arrow_right"
          isOpen={false}
          handleClick={() => onNavigateNextDay?.()}
          handleKeyDown={() => {}}
        />
        <NavbarIcon
          iconName="keyboard_double_arrow_right"
          isOpen={false}
          handleClick={() => onNavigateNextWeek?.()}
          handleKeyDown={() => {}}
        />
      </div>
    </nav>
  );
};
