import { container } from '$lib/container';
import { PreferencesService } from '$lib/services/preferencesService';

const preferencesService = new PreferencesService(container.httpClient);

class FilterStore {
    tags = $state<string[]>([]);
    projectId = $state<string | null>(null);
    priority = $state<string | null>(null);
    showCompleted = $state(true);

    get activeFilterCount() {
        let count = 0;
        if (this.tags?.length > 0) count += this.tags.length;
        if (this.projectId) count++;
        if (this.priority) count++;
        if (!this.showCompleted) count++;
        return count;
    }

    setTags(tags: string[]) {
        this.tags = tags;
    }

    toggleTag(tag: string) {
        if (this.tags.includes(tag)) {
            this.tags = this.tags.filter(t => t !== tag);
        } else {
            this.tags = [...this.tags, tag];
        }
    }

    setProject(projectId: string | null) {
        this.projectId = projectId;
    }

    setPriority(priority: string | null) {
        this.priority = priority;
    }

    setShowCompleted(show: boolean) {
        this.showCompleted = show;
    }

    clearAll() {
        this.tags = [];
        this.projectId = null;
        this.priority = null;
        this.showCompleted = true;
    }

    async loadFromPreferences() {
        try {
            const prefs = await preferencesService.get();
            this.tags = prefs.activeFilters.tags;
            this.projectId = prefs.activeFilters.projectId;
            this.priority = prefs.activeFilters.priority;
            this.showCompleted = prefs.activeFilters.showCompleted;
        } catch {
            // Use defaults if preferences not available
        }
    }

    async saveToPreferences() {
        try {
            await preferencesService.update({
                activeFilters: {
                    tags: this.tags,
                    projectId: this.projectId,
                    priority: this.priority,
                    showCompleted: this.showCompleted,
                },
            });
        } catch {
            // Silently fail — preferences are nice-to-have
        }
    }
}

export const filterStore = new FilterStore();
