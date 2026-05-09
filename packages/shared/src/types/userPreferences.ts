export type ThemeType = 'light' | 'dark' | 'system';
export type DeleteConfirmationType = 'instant' | 'confirm';
export type NotificationPosition =
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'top-right'
    | 'top-left';

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
    projectId: string | null;
    priority: string | null;
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
    collapsedSections: string[];
    activeFilters: ActiveFilters;
    tagKinds: TagKind[];
    tagKindMap: Record<string, string>;
    notificationPosition: NotificationPosition;
    updatedAt: string;
}

export type UpdateUserPreferencesInput = Partial<Omit<UserPreferences, 'id' | 'updatedAt'>>;
