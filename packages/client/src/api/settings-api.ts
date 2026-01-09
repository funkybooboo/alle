import { gql } from 'graphql-request';
import { graphqlClient } from './graphql-client';
import type { UserSettings } from '../types/settings.types';
import { DEFAULT_SETTINGS } from '../types/settings.types';

// GraphQL Queries
const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      id
      columnMinWidth
      todayShowsPrevious
      singleArrowDays
      doubleArrowDays
      autoColumnBreakpoints
      autoColumnCounts
    }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdateSettings(
    $columnMinWidth: Int
    $todayShowsPrevious: Boolean
    $singleArrowDays: Int
    $doubleArrowDays: Int
    $autoColumnBreakpoints: JSON
    $autoColumnCounts: JSON
  ) {
    updateSettings(
      input: {
        columnMinWidth: $columnMinWidth
        todayShowsPrevious: $todayShowsPrevious
        singleArrowDays: $singleArrowDays
        doubleArrowDays: $doubleArrowDays
        autoColumnBreakpoints: $autoColumnBreakpoints
        autoColumnCounts: $autoColumnCounts
      }
    ) {
      id
      columnMinWidth
      todayShowsPrevious
      singleArrowDays
      doubleArrowDays
      autoColumnBreakpoints
      autoColumnCounts
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
  autoColumnBreakpoints: string | object;
  autoColumnCounts: string | object;
}

// Convert GraphQL settings to frontend UserSettings type
const toSettings = (gqlSettings: GraphQLSettings): UserSettings => {
  // Parse JSON fields if they're strings
  const breakpoints =
    typeof gqlSettings.autoColumnBreakpoints === 'string'
      ? JSON.parse(gqlSettings.autoColumnBreakpoints)
      : gqlSettings.autoColumnBreakpoints;

  const counts =
    typeof gqlSettings.autoColumnCounts === 'string'
      ? JSON.parse(gqlSettings.autoColumnCounts)
      : gqlSettings.autoColumnCounts;

  return {
    id: gqlSettings.id,
    columnMinWidth: gqlSettings.columnMinWidth,
    todayShowsPrevious: gqlSettings.todayShowsPrevious,
    singleArrowDays: gqlSettings.singleArrowDays,
    doubleArrowDays: gqlSettings.doubleArrowDays,
    autoColumnBreakpoints: breakpoints,
    autoColumnCounts: counts,
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
    const data = await graphqlClient.request<{
      updateSettings: GraphQLSettings;
    }>(UPDATE_SETTINGS, {
      columnMinWidth: settings.columnMinWidth,
      todayShowsPrevious: settings.todayShowsPrevious,
      singleArrowDays: settings.singleArrowDays,
      doubleArrowDays: settings.doubleArrowDays,
      autoColumnBreakpoints: settings.autoColumnBreakpoints,
      autoColumnCounts: settings.autoColumnCounts,
    });
    return toSettings(data.updateSettings);
  },
};
