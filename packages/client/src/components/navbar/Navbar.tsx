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
  onCalendarToggle,
  className = '',
}: NavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    onSearchToggle?.();
  };

  const handleCalendarToggle = () => {
    setIsCalendarOpen(!isCalendarOpen);
    onCalendarToggle?.();
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
      className={`w-full flex sticky items-center px-4 py-1 flex-row h-10 ${styles.navbar} ${className}`}
    >
      <div className="flex-1 flex flex-row items-center gap-4">
        <NavbarIcon
          iconName="search"
          isOpen={isSearchOpen}
          handleClick={handleSearchToggle}
          handleKeyDown={handleKeyDown}
          title="Search (/)"
        />
        <div className={`block md:hidden ${styles.today}`}>
          {formatCurrentDate()}
        </div>
      </div>

      <div className="flex justify-center">
        <h1 className={`hidden md:block ${styles.title}`}>Alle</h1>
      </div>

      <div className="flex-1 flex flex-row gap-1 items-center justify-end">
        <button
          onClick={() => onNavigateToday?.()}
          className="px-3 py-1 rounded bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors mr-2"
          data-testid="today-button"
          title="Today (t)"
          aria-label="Go to today"
        >
          Today
        </button>
        <NavbarIcon
          iconName="keyboard_double_arrow_left"
          isOpen={false}
          handleClick={() => onNavigatePrevWeek?.()}
          handleKeyDown={() => {}}
          title="Previous week (Shift+H)"
        />
        <NavbarIcon
          iconName="keyboard_arrow_left"
          isOpen={false}
          handleClick={() => onNavigatePrevDay?.()}
          handleKeyDown={() => {}}
          title="Previous day (h)"
        />
        <NavbarIcon
          iconName="keyboard_arrow_right"
          isOpen={false}
          handleClick={() => onNavigateNextDay?.()}
          handleKeyDown={() => {}}
          title="Next day (l)"
        />
        <NavbarIcon
          iconName="keyboard_double_arrow_right"
          isOpen={false}
          handleClick={() => onNavigateNextWeek?.()}
          handleKeyDown={() => {}}
          title="Next week (Shift+L)"
        />
        <NavbarIcon
          iconName="calendar_month"
          isOpen={isCalendarOpen}
          handleClick={handleCalendarToggle}
          handleKeyDown={() => {}}
          title="Calendar (g)"
        />
      </div>
    </nav>
  );
};
