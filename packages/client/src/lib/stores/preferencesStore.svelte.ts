import type {
    ActiveFilters,
    DeleteConfirmationType,
    NotificationPosition,
    TagKind,
    ThemeType,
    UserPreferences,
} from '@alle/shared';
import {
    DEFAULT_COLLAPSED_SECTIONS,
    DEFAULT_TAG_KIND_MAP,
    DEFAULT_TAG_KINDS,
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
    someDayPanelCollapsed = $state(false);
    someDayPanelLastOpenWidth = $state<number>(USER_PREFERENCES_DEFAULTS.someDayPanelLastOpenWidth);
    rolloverEnabled = $state(true);
    showEmptyDays = $state(true);
    deleteConfirmation = $state<DeleteConfirmationType>('instant');
    collapsedSections = $state<string[]>([...DEFAULT_COLLAPSED_SECTIONS]);
    activeFilters = $state<ActiveFilters>({
        tags: [],
        projectId: null,
        priority: null,
        showCompleted: true,
    });
    tagKinds = $state<TagKind[]>([...DEFAULT_TAG_KINDS]);
    tagKindMap = $state<Record<string, string>>({ ...DEFAULT_TAG_KIND_MAP });
    notificationPosition = $state<NotificationPosition>('bottom-right');
    updatedAt = $state(new Date().toISOString());

    isSectionCollapsed(sectionId: string): boolean {
        return this.collapsedSections.includes(sectionId);
    }

    toggleSectionCollapsed(sectionId: string) {
        if (this.collapsedSections.includes(sectionId)) {
            this.collapsedSections = this.collapsedSections.filter(id => id !== sectionId);
        } else {
            this.collapsedSections = [...this.collapsedSections, sectionId];
        }
        preferencesService.update({ collapsedSections: this.collapsedSections }).catch(() => {});
    }

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

    setShowCompleted(show: boolean) {
        this.activeFilters = { ...this.activeFilters, showCompleted: show };
        preferencesService.update({ activeFilters: this.activeFilters }).catch(() => {});
    }

    setProject(projectId: string | null) {
        this.activeFilters = { ...this.activeFilters, projectId };
        preferencesService.update({ activeFilters: this.activeFilters }).catch(() => {});
    }

    setPriority(priority: string | null) {
        this.activeFilters = { ...this.activeFilters, priority };
        preferencesService.update({ activeFilters: this.activeFilters }).catch(() => {});
    }

    clearAll() {
        this.activeFilters = { tags: [], projectId: null, priority: null, showCompleted: true };
        preferencesService.update({ activeFilters: this.activeFilters }).catch(() => {});
    }

    get activeFilterCount() {
        let count = 0;
        if (this.activeFilters.tags?.length > 0) count += this.activeFilters.tags.length;
        if (!this.activeFilters.showCompleted) count++;
        if (this.activeFilters.projectId) count++;
        if (this.activeFilters.priority) count++;
        return count;
    }

    async load() {
        try {
            const prefs = await preferencesService.get();
            this.id = prefs.id;
            this.theme = prefs.theme;
            this.locale = prefs.locale;
            this.someDayPanelWidth = prefs.someDayPanelWidth;
            this.someDayPanelCollapsed = prefs.someDayPanelCollapsed;
            this.someDayPanelLastOpenWidth =
                prefs.someDayPanelLastOpenWidth ??
                USER_PREFERENCES_DEFAULTS.someDayPanelLastOpenWidth;
            this.rolloverEnabled = prefs.rolloverEnabled;
            this.showEmptyDays = prefs.showEmptyDays;
            this.deleteConfirmation = prefs.deleteConfirmation ?? 'instant';
            this.collapsedSections = prefs.collapsedSections ?? [...DEFAULT_COLLAPSED_SECTIONS];
            this.activeFilters = prefs.activeFilters;
            this.tagKinds = prefs.tagKinds ?? [...DEFAULT_TAG_KINDS];
            this.tagKindMap = prefs.tagKindMap ?? { ...DEFAULT_TAG_KIND_MAP };
            this.notificationPosition = prefs.notificationPosition ?? 'bottom-right';
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
            someDayPanelLastOpenWidth: this.someDayPanelLastOpenWidth,
            rolloverEnabled: this.rolloverEnabled,
            showEmptyDays: this.showEmptyDays,
            deleteConfirmation: this.deleteConfirmation,
            collapsedSections: this.collapsedSections,
            activeFilters: this.activeFilters,
            tagKinds: this.tagKinds,
            tagKindMap: this.tagKindMap,
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

    setPanelCollapsed(collapsed: boolean) {
        this.someDayPanelCollapsed = collapsed;
        preferencesService.update({ someDayPanelCollapsed: collapsed }).catch(() => {});
    }

    setShowEmptyDays(show: boolean) {
        this.showEmptyDays = show;
        preferencesService.update({ showEmptyDays: show }).catch(() => {});
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

    setNotificationPosition(position: NotificationPosition) {
        this.notificationPosition = position;
        preferencesService.update({ notificationPosition: position }).catch(() => {});
    }
}

export const preferencesStore = new PreferencesStore();
