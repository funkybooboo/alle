export interface NavbarProps {
  currentDate?: Date;
  onNavigateToday?: () => void;
  onNavigatePrevDay?: () => void;
  onNavigateNextDay?: () => void;
  onNavigatePrevWeek?: () => void;
  onNavigateNextWeek?: () => void;
  onSearchToggle?: () => void;
  onCalendarToggle?: () => void;
  className?: string;
}
