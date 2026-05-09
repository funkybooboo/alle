import { container } from '$lib/container';
import { TagService } from '$lib/services/tagService';

const tagService = new TagService(container.httpClient);

class TagStore {
    tags = $state<string[]>([]);

    async fetchAll() {
        try {
            this.tags = await tagService.getAll();
        } catch {
            // Keep empty state
        }
    }

    async rename(from: string, to: string) {
        try {
            await tagService.rename(from, to);
            await this.fetchAll();
            return true;
        } catch {
            return false;
        }
    }

    async merge(sources: string[], target: string) {
        try {
            await tagService.merge(sources, target);
            await this.fetchAll();
            return true;
        } catch {
            return false;
        }
    }
}

export const tagStore = new TagStore();
