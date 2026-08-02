export type ThemeType = 'light' | 'dark' | 'system';
export type DeleteConfirmationType = 'instant' | 'confirm';
export type TimeFormatType = '12h' | '24h';

/** Validates that a string is a known IANA timezone via Intl. */
export function isValidTimeZone(timeZone: string): boolean {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone });
        return true;
    } catch {
        return false;
    }
}

export type TagKindBehavior = 'single' | 'multiple';

export interface TagKind {
    id: string;
    name: string;
    behavior: TagKindBehavior;
    prefix: string | null;
    sortOrder: number;
    color: string | null;
}

export interface ActiveFilters {
    tags: string[];
    showCompleted: boolean;
}

export interface UserPreferences {
    id: 'default';
    theme: ThemeType;
    locale: string;
    someDayPanelWidth: number;
    someDayPanelCollapsed: boolean;
    someDayPanelLastOpenWidth: number;
    rolloverEnabled: boolean;
    showEmptyDays: boolean;
    deleteConfirmation: DeleteConfirmationType;
    activeFilters: ActiveFilters;
    tagKinds: TagKind[];
    tagKindMap: Record<string, string>;
    timeFormat: TimeFormatType;
    /** IANA timezone (e.g. 'America/Denver') or null to follow the device zone. */
    timezone: string | null;
    updatedAt: string;
}

export type UpdateUserPreferencesInput = Partial<Omit<UserPreferences, 'id' | 'updatedAt'>>;
