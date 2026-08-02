import type {
    ActiveFilters,
    DateProvider,
    UpdateUserPreferencesInput,
    UserPreferences,
} from '@alle/shared';
import { DEFAULT_TAG_KIND_MAP, DEFAULT_TAG_KINDS } from '@alle/shared';
import type { UserPreferencesRepository } from './UserPreferencesRepository';

const DEFAULT_ACTIVE_FILTERS: ActiveFilters = {
    tags: [],
    showCompleted: true,
};

function defaultPreferences(timestamp: string): UserPreferences {
    return {
        id: 'default',
        theme: 'system',
        locale: 'en',
        someDayPanelWidth: 280,
        someDayPanelCollapsed: false,
        someDayPanelLastOpenWidth: 280,
        rolloverEnabled: true,
        showEmptyDays: true,
        deleteConfirmation: 'instant',
        activeFilters: { ...DEFAULT_ACTIVE_FILTERS },
        tagKinds: [...DEFAULT_TAG_KINDS],
        tagKindMap: { ...DEFAULT_TAG_KIND_MAP },
        timeFormat: '12h',
        timezone: null,
        updatedAt: timestamp,
    };
}

export class InMemoryUserPreferencesRepository implements UserPreferencesRepository {
    private preferences: UserPreferences;

    constructor(private dateProvider: DateProvider) {
        this.preferences = defaultPreferences(this.dateProvider.timestamp());
    }

    async get(): Promise<UserPreferences> {
        return {
            ...this.preferences,
            activeFilters: { ...this.preferences.activeFilters },
            tagKinds: [...this.preferences.tagKinds],
            tagKindMap: { ...this.preferences.tagKindMap },
        };
    }

    async update(input: UpdateUserPreferencesInput): Promise<UserPreferences> {
        this.preferences = {
            ...this.preferences,
            ...input,
            activeFilters: input.activeFilters
                ? { ...input.activeFilters }
                : { ...this.preferences.activeFilters },
            tagKinds: input.tagKinds ? [...input.tagKinds] : [...this.preferences.tagKinds],
            tagKindMap: input.tagKindMap
                ? { ...input.tagKindMap }
                : { ...this.preferences.tagKindMap },
            updatedAt: this.dateProvider.timestamp(),
        };
        return this.get();
    }

    async reset(): Promise<void> {
        this.preferences = defaultPreferences(this.dateProvider.timestamp());
    }
}
