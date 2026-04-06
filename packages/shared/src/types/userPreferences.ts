/**
 * Active filter state — persisted per-user so filters survive page reloads
 */
export interface ActiveFilters {
    tags: string[];
    projectId: string | null;
    priority: string | null;
    showCompleted: boolean;
}

/**
 * UserPreferences — all user-configurable settings and UI state.
 * Single-row entity (id is always 'default') for single-user mode.
 */
export interface UserPreferences {
    id: 'default';
    theme: 'light' | 'dark' | 'system';
    locale: string;
    someDayPanelWidth: number;
    someDayPanelCollapsed: boolean;
    rolloverEnabled: boolean;
    showEmptyDays: boolean;
    activeFilters: ActiveFilters;
    updatedAt: string;
}

/**
 * Input for updating user preferences. All fields are optional.
 */
export type UpdateUserPreferencesInput = Partial<Omit<UserPreferences, 'id' | 'updatedAt'>>;
