import { container } from '$lib/container';
import { TagService } from '$lib/services/tagService';

const tagService = new TagService(container.httpClient);

class TagStore {
    tags = $state<string[]>([]);

    async fetchAll() {
        try {
            const tags = await tagService.getAll();
            this.tags = tags;
        } catch {
            // Keep empty state
        }
    }

    async rename(oldName: string, newName: string) {
        try {
            const tags = await tagService.rename(oldName, newName);
            this.tags = tags;
            return true;
        } catch {
            return false;
        }
    }

    async merge(sourceTag: string, targetTag: string) {
        try {
            const tags = await tagService.merge(sourceTag, targetTag);
            this.tags = tags;
            return true;
        } catch {
            return false;
        }
    }
}

export const tagStore = new TagStore();
