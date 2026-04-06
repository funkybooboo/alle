import type {
    ActiveFilters,
    DateProvider,
    UpdateUserPreferencesInput,
    UserPreferences,
} from '@alle/shared';
import type { UserPreferencesRepository } from './UserPreferencesRepository';

const DEFAULT_ACTIVE_FILTERS: ActiveFilters = {
    tags: [],
    projectId: null,
    priority: null,
    showCompleted: false,
};

function defaultPreferences(timestamp: string): UserPreferences {
    return {
        id: 'default',
        theme: 'system',
        locale: 'en',
        someDayPanelWidth: 300,
        someDayPanelCollapsed: false,
        rolloverEnabled: true,
        showEmptyDays: true,
        activeFilters: { ...DEFAULT_ACTIVE_FILTERS },
        updatedAt: timestamp,
    };
}

export class InMemoryUserPreferencesRepository implements UserPreferencesRepository {
    private preferences: UserPreferences;

    constructor(private dateProvider: DateProvider) {
        this.preferences = defaultPreferences(this.dateProvider.timestamp());
    }

    async get(): Promise<UserPreferences> {
        return { ...this.preferences, activeFilters: { ...this.preferences.activeFilters } };
    }

    async update(input: UpdateUserPreferencesInput): Promise<UserPreferences> {
        this.preferences = {
            ...this.preferences,
            ...input,
            activeFilters: input.activeFilters
                ? { ...input.activeFilters }
                : { ...this.preferences.activeFilters },
            updatedAt: this.dateProvider.timestamp(),
        };
        return this.get();
    }

    async reset(): Promise<void> {
        this.preferences = defaultPreferences(this.dateProvider.timestamp());
    }
}
