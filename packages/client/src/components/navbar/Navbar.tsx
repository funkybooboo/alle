import { useState } from 'react';
import { IconButton } from '../shared/IconButton';
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
      className={`w-full flex sticky top-0 z-50 items-center px-4 py-1 flex-row h-10 ${styles.navbar} ${className}`}
    >
      <div className="flex-1 flex flex-row items-center gap-4">
        <IconButton
          icon="search"
          toggled={isSearchOpen}
          onClick={handleSearchToggle}
          label="Search (,)"
        />
        <div className={`block md:hidden ${styles.today}`}>
          {formatCurrentDate()}
        </div>
      </div>

      <div className="flex justify-center">
        <h1
          className={`hidden md:block font-[Courier_New,Courier,monospace] font-bold text-lg`}
        >
          Alle
        </h1>
      </div>

      <div className="flex-1 flex flex-row gap-1 items-center justify-end">
        <IconButton
          icon="today"
          onClick={() => onNavigateToday?.()}
          label="Go to today (Home)"
        />
        <IconButton
          icon="keyboard_double_arrow_left"
          onClick={() => onNavigatePrevWeek?.()}
          label="Previous week (Shift+←)"
        />
        <IconButton
          icon="keyboard_arrow_left"
          onClick={() => onNavigatePrevDay?.()}
          label="Previous day (←)"
        />
        <IconButton
          icon="keyboard_arrow_right"
          onClick={() => onNavigateNextDay?.()}
          label="Next day (→)"
        />
        <IconButton
          icon="keyboard_double_arrow_right"
          onClick={() => onNavigateNextWeek?.()}
          label="Next week (Shift+→)"
        />
        <IconButton
          icon="calendar_month"
          toggled={isCalendarOpen}
          onClick={handleCalendarToggle}
          label="Calendar (Alt+C)"
        />
      </div>
    </nav>
  );
};
