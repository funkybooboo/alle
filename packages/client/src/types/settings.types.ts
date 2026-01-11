export type Theme = 'LIGHT' | 'DARK';

export interface KeyboardShortcuts {
  navigatePrevDay: string;
  navigateNextDay: string;
  navigatePrevWeek: string;
  navigateNextWeek: string;
  navigateToday: string;
  toggleSearch: string;
  toggleSettings: string;
  toggleTrash: string;
  toggleCalendar: string;
  toggleHelp: string;
  decreaseColumns: string;
  increaseColumns: string;
  toggleAutoMode: string;
  toggleTheme: string;
  closePanel: string;
}

export const DEFAULT_SHORTCUTS: KeyboardShortcuts = {
  navigatePrevDay: 'ArrowLeft',
  navigateNextDay: 'ArrowRight',
  navigatePrevWeek: 'Shift+ArrowLeft',
  navigateNextWeek: 'Shift+ArrowRight',
  navigateToday: 'Home',
  toggleSearch: ',',
  toggleSettings: 'Alt+,',
  toggleTrash: 'Alt+t',
  toggleCalendar: 'Alt+c',
  toggleHelp: '?',
  decreaseColumns: '[',
  increaseColumns: ']',
  toggleAutoMode: 'Alt+a',
  toggleTheme: 'Alt+Shift+d',
  closePanel: 'Escape',
};

export interface UserSettings {
  id?: string;
  columnMinWidth: number; // Minimum pixel width for columns
  todayShowsPrevious: boolean; // Whether Today button shows previous day
  singleArrowDays: number; // Number of days single arrow moves
  doubleArrowDays: number; // Number of days double arrow moves
  autoColumnBreakpoints: {
    small: number; // Width threshold for small screens
    medium: number; // Width threshold for medium screens
    large: number; // Width threshold for large screens
    xlarge: number; // Width threshold for extra large screens
  };
  autoColumnCounts: {
    small: number; // Number of columns for small screens
    medium: number; // Number of columns for medium screens
    large: number; // Number of columns for large screens
    xlarge: number; // Number of columns for extra large screens
    xxlarge: number; // Number of columns for ultra-wide screens
  };
  drawerHeight: number; // Height of the someday drawer in pixels
  drawerIsOpen: boolean; // Whether the someday drawer is open
  theme: Theme; // Light or dark mode
  keyboardShortcuts: KeyboardShortcuts; // Custom keyboard shortcuts
  fontSize: 'small' | 'medium' | 'large';
  fontType: 'sans' | 'serif' | 'mono' | 'opendyslexic';
}

export const DEFAULT_SETTINGS: UserSettings = {
  columnMinWidth: 300,
  todayShowsPrevious: false,
  singleArrowDays: 1,
  doubleArrowDays: 7,
  autoColumnBreakpoints: {
    small: 640,
    medium: 1024,
    large: 1536,
    xlarge: 2048,
  },
  autoColumnCounts: {
    small: 1,
    medium: 2,
    large: 3,
    xlarge: 5,
    xxlarge: 7,
  },
  drawerHeight: 300,
  drawerIsOpen: true,
  theme: 'DARK',
  keyboardShortcuts: DEFAULT_SHORTCUTS,
  fontSize: 'medium',
  fontType: 'sans',
};
