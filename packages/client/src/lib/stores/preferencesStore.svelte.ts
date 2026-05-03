import type { UserPreferences } from '@alle/shared';
import { container } from '$lib/container';
import { PreferencesService } from '$lib/services/preferencesService';

const preferencesService = new PreferencesService(container.httpClient);

class PreferencesStore {
    id = $state('default');
    theme = $state<'light' | 'dark' | 'system'>('system');
    locale = $state('en');
    someDayPanelWidth = $state(280);
    someDayPanelCollapsed = $state(false);
    rolloverEnabled = $state(true);
    showEmptyDays = $state(true);
    deleteConfirmation = $state<'instant' | 'confirm'>('instant');
    activeFilters = $state<ActiveFilters>({
        tags: [],
        projectId: null,
        priority: null,
        showCompleted: true,
    });
    updatedAt = $state(new Date().toISOString());

    async load() {
        try {
            const prefs = await preferencesService.get();
            this.id = prefs.id;
            this.theme = prefs.theme;
            this.locale = prefs.locale;
            this.someDayPanelWidth = prefs.someDayPanelWidth;
            this.someDayPanelCollapsed = prefs.someDayPanelCollapsed;
            this.rolloverEnabled = prefs.rolloverEnabled;
            this.showEmptyDays = prefs.showEmptyDays;
            this.deleteConfirmation = prefs.deleteConfirmation ?? 'instant';
            this.activeFilters = prefs.activeFilters;
            this.updatedAt = prefs.updatedAt;
        } catch {
            // Use defaults
        }
    }

    async save(partial: Partial<Omit<UserPreferences, 'id' | 'updatedAt'>>) {
        const current = {
            id: this.id,
            theme: this.theme,
            locale: this.locale,
            someDayPanelWidth: this.someDayPanelWidth,
            someDayPanelCollapsed: this.someDayPanelCollapsed,
            rolloverEnabled: this.rolloverEnabled,
            showEmptyDays: this.showEmptyDays,
            deleteConfirmation: this.deleteConfirmation,
            activeFilters: this.activeFilters,
            updatedAt: this.updatedAt,
        };

        const merged = { ...current, ...partial };
        Object.assign(this, partial);

        try {
            const updated = await preferencesService.update(partial);
            Object.assign(this, updated);
        } catch {
            Object.assign(this, current);
        }
        return merged;
    }

    setTheme(theme: 'light' | 'dark' | 'system') {
        this.theme = theme;
        preferencesService.update({ theme }).catch(() => {});
    }

    setPanelWidth(width: number) {
        this.someDayPanelWidth = width;
        preferencesService.update({ someDayPanelWidth: width }).catch(() => {});
    }

    setPanelCollapsed(collapsed: boolean) {
        this.someDayPanelCollapsed = collapsed;
        preferencesService.update({ someDayPanelCollapsed: collapsed }).catch(() => {});
    }

    setShowEmptyDays(show: boolean) {
        this.showEmptyDays = show;
        preferencesService.update({ showEmptyDays: show }).catch(() => {});
    }

    setDeleteConfirmation(value: 'instant' | 'confirm') {
        this.deleteConfirmation = value;
        preferencesService.update({ deleteConfirmation: value }).catch(() => {});
    }
}

type ActiveFilters = {
    tags: string[];
    projectId: string | null;
    priority: string | null;
    showCompleted: boolean;
};

export const preferencesStore = new PreferencesStore();
