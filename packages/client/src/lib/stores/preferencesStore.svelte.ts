import type {
    ActiveFilters,
    DeleteConfirmationType,
    TagKind,
    ThemeType,
    TimeFormatType,
    UserPreferences,
} from '@alle/shared';
import {
    DEFAULT_TAG_KIND_MAP,
    DEFAULT_TAG_KINDS,
    isValidTimeZone,
    USER_PREFERENCES_DEFAULTS,
} from '@alle/shared';
import { container } from '$lib/container';
import { PreferencesService } from '$lib/services/preferencesService';

const preferencesService = new PreferencesService(container.httpClient);

class PreferencesStore {
    id = $state('default');
    theme = $state<ThemeType>('system');
    locale = $state('en');
    someDayPanelWidth = $state<number>(USER_PREFERENCES_DEFAULTS.someDayPanelWidth);
    someDayPanelLastOpenWidth = $state<number>(USER_PREFERENCES_DEFAULTS.someDayPanelLastOpenWidth);
    rolloverEnabled = $state(true);
    showEmptyDays = $state(true);
    deleteConfirmation = $state<DeleteConfirmationType>('instant');
    activeFilters = $state<ActiveFilters>({
        tags: [],
        showCompleted: true,
    });
    tagKinds = $state<TagKind[]>([...DEFAULT_TAG_KINDS]);
    tagKindMap = $state<Record<string, string>>({ ...DEFAULT_TAG_KIND_MAP });
    timeFormat = $state<TimeFormatType>('12h');
    timezone = $state<string | null>(null);
    updatedAt = $state(new Date().toISOString());

    toggleTag(tag: string) {
        if (this.activeFilters.tags.includes(tag)) {
            this.activeFilters = {
                ...this.activeFilters,
                tags: this.activeFilters.tags.filter(t => t !== tag),
            };
        } else {
            this.activeFilters = { ...this.activeFilters, tags: [...this.activeFilters.tags, tag] };
        }
        preferencesService.update({ activeFilters: this.activeFilters }).catch(() => {});
    }

    setTags(tags: string[]) {
        this.activeFilters = { ...this.activeFilters, tags };
        preferencesService.update({ activeFilters: this.activeFilters }).catch(() => {});
    }

    clearAll() {
        this.activeFilters = { tags: [], showCompleted: true };
        preferencesService.update({ activeFilters: this.activeFilters }).catch(() => {});
    }

    get activeFilterCount() {
        return this.activeFilters.tags?.length ?? 0;
    }

    async load() {
        try {
            const prefs = await preferencesService.get();
            this.id = prefs.id;
            this.theme = prefs.theme;
            this.locale = prefs.locale;
            this.someDayPanelWidth = prefs.someDayPanelWidth;
            this.someDayPanelLastOpenWidth =
                prefs.someDayPanelLastOpenWidth ??
                USER_PREFERENCES_DEFAULTS.someDayPanelLastOpenWidth;
            this.rolloverEnabled = prefs.rolloverEnabled;
            this.showEmptyDays = prefs.showEmptyDays;
            this.deleteConfirmation = prefs.deleteConfirmation ?? 'instant';
            this.activeFilters = prefs.activeFilters;
            this.tagKinds = prefs.tagKinds ?? [...DEFAULT_TAG_KINDS];
            this.tagKindMap = prefs.tagKindMap ?? { ...DEFAULT_TAG_KIND_MAP };
            this.updatedAt = prefs.updatedAt;
            this.timeFormat = prefs.timeFormat ?? '12h';
            this.timezone = prefs.timezone ?? null;
            container.setDateProviderTimeZone(this.timezone);
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
            someDayPanelLastOpenWidth: this.someDayPanelLastOpenWidth,
            rolloverEnabled: this.rolloverEnabled,
            showEmptyDays: this.showEmptyDays,
            deleteConfirmation: this.deleteConfirmation,
            activeFilters: this.activeFilters,
            tagKinds: this.tagKinds,
            tagKindMap: this.tagKindMap,
            timeFormat: this.timeFormat,
            timezone: this.timezone,
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

    setTheme(theme: ThemeType) {
        this.theme = theme;
        preferencesService.update({ theme }).catch(() => {});
    }

    setPanelWidth(width: number) {
        this.someDayPanelWidth = width;
        if (width >= 200) {
            this.someDayPanelLastOpenWidth = width;
        }
        preferencesService
            .update({
                someDayPanelWidth: width,
                someDayPanelLastOpenWidth: this.someDayPanelLastOpenWidth,
            })
            .catch(() => {});
    }

    setDeleteConfirmation(value: DeleteConfirmationType) {
        this.deleteConfirmation = value;
        preferencesService.update({ deleteConfirmation: value }).catch(() => {});
    }

    updateTagKinds(tagKinds: TagKind[], tagKindMap: Record<string, string>) {
        this.tagKinds = tagKinds;
        this.tagKindMap = tagKindMap;
        preferencesService.update({ tagKinds, tagKindMap }).catch(() => {});
    }

    setTimeFormat(format: TimeFormatType) {
        this.timeFormat = format;
        preferencesService.update({ timeFormat: format }).catch(() => {});
    }

    /**
     * Set the timezone (IANA zone) or null for device-local. Validates via
     * isValidTimeZone; invalid values are ignored and the previous zone stays.
     * Pushes the live zone to the date provider so today()/clock update.
     */
    setTimezone(timezone: string | null) {
        if (timezone !== null && !isValidTimeZone(timezone)) return;
        const normalized = timezone === '' ? null : timezone;
        container.setDateProviderTimeZone(normalized);
        this.timezone = normalized;
        preferencesService.update({ timezone: normalized }).catch(() => {});
    }
}

export const preferencesStore = new PreferencesStore();
