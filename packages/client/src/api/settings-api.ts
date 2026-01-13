import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type { UserSettings, KeyboardShortcuts } from '../types/settings.types';
import { DEFAULT_SETTINGS, DEFAULT_SHORTCUTS } from '../types/settings.types';

// GraphQL Queries
const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      id
      columnMinWidth
      todayShowsPrevious
      singleArrowDays
      doubleArrowDays
      drawerHeight
      drawerIsOpen
      theme
    }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdateSettings(
    $columnMinWidth: Int
    $todayShowsPrevious: Boolean
    $singleArrowDays: Int
    $doubleArrowDays: Int
    $drawerHeight: Int
    $drawerIsOpen: Boolean
    $theme: Theme
  ) {
    updateSettings(
      input: {
        columnMinWidth: $columnMinWidth
        todayShowsPrevious: $todayShowsPrevious
        singleArrowDays: $singleArrowDays
        doubleArrowDays: $doubleArrowDays
        drawerHeight: $drawerHeight
        drawerIsOpen: $drawerIsOpen
        theme: $theme
      }
    ) {
      id
      columnMinWidth
      todayShowsPrevious
      singleArrowDays
      doubleArrowDays
      drawerHeight
      drawerIsOpen
      theme
    }
  }
`;

// Type for GraphQL settings response
interface GraphQLSettings {
  id: string;
  columnMinWidth: number;
  todayShowsPrevious: boolean;
  singleArrowDays: number;
  doubleArrowDays: number;
  drawerHeight: number;
  drawerIsOpen: boolean;
  theme: 'LIGHT' | 'DARK';
}

// Convert GraphQL settings to frontend UserSettings type
const toSettings = (gqlSettings: GraphQLSettings): UserSettings => {
  // Use default values for autoColumn settings
  const breakpoints = DEFAULT_SETTINGS.autoColumnBreakpoints;
  const counts = DEFAULT_SETTINGS.autoColumnCounts;

  // Load visual settings from localStorage
  const storedFontSize = localStorage.getItem('alle_fontSize') as
    | 'small'
    | 'medium'
    | 'large'
    | null;
  const storedFontType = localStorage.getItem('alle_fontType') as
    | 'sans'
    | 'serif'
    | 'mono'
    | 'opendyslexic'
    | null;

  // Load keyboard shortcuts from localStorage
  let keyboardShortcuts: KeyboardShortcuts = DEFAULT_SHORTCUTS;
  const storedShortcuts = localStorage.getItem('alle_keyboardShortcuts');
  if (storedShortcuts) {
    try {
      keyboardShortcuts = JSON.parse(storedShortcuts);
    } catch (e) {
      console.error('Failed to parse keyboard shortcuts from localStorage', e);
    }
  }

  return {
    id: gqlSettings.id,
    columnMinWidth: gqlSettings.columnMinWidth,
    todayShowsPrevious: gqlSettings.todayShowsPrevious,
    singleArrowDays: gqlSettings.singleArrowDays,
    doubleArrowDays: gqlSettings.doubleArrowDays,
    autoColumnBreakpoints: breakpoints,
    autoColumnCounts: counts,
    drawerHeight: gqlSettings.drawerHeight,
    drawerIsOpen: gqlSettings.drawerIsOpen,
    theme: gqlSettings.theme,
    keyboardShortcuts,
    fontSize: storedFontSize || DEFAULT_SETTINGS.fontSize,
    fontType: storedFontType || DEFAULT_SETTINGS.fontType,
  };
};

// API functions
export const settingsAPI = {
  async getSettings(): Promise<UserSettings> {
    try {
      const data = await graphqlClient.request<{ settings: GraphQLSettings }>(
        GET_SETTINGS
      );
      return toSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings, using defaults:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    // Persist visual settings to localStorage
    if (settings.fontSize) {
      localStorage.setItem('alle_fontSize', settings.fontSize);
    }
    if (settings.fontType) {
      localStorage.setItem('alle_fontType', settings.fontType);
    }
    if (settings.keyboardShortcuts) {
      localStorage.setItem(
        'alle_keyboardShortcuts',
        JSON.stringify(settings.keyboardShortcuts)
      );
    }

    const data = await graphqlClient.request<{
      updateSettings: GraphQLSettings;
    }>(UPDATE_SETTINGS, {
      columnMinWidth: settings.columnMinWidth,
      todayShowsPrevious: settings.todayShowsPrevious,
      singleArrowDays: settings.singleArrowDays,
      doubleArrowDays: settings.doubleArrowDays,
      drawerHeight: settings.drawerHeight,
      drawerIsOpen: settings.drawerIsOpen,
      theme: settings.theme,
    });
    return toSettings(data.updateSettings);
  },
};
