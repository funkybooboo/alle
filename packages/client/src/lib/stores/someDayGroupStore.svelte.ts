import type { SomeDayGroup } from '@alle/shared';
import { container } from '$lib/container';
import { SomeDayGroupService } from '$lib/services/someDayGroupService';

const someDayGroupService = new SomeDayGroupService(container.httpClient);

class SomeDayGroupStore {
    groups = $state<SomeDayGroup[]>([]);

    get sortedGroups() {
        return [...this.groups].sort((a, b) => a.position - b.position);
    }

    async fetchAll() {
        try {
            const groups = await someDayGroupService.getAll();
            this.groups = groups.sort((a, b) => a.position - b.position);
        } catch {
            // Keep empty state
        }
    }

    async create(input: {
        name: string;
        tag: string;
        position: number;
        description?: string | null;
    }) {
        try {
            const group = await someDayGroupService.create(input);
            this.groups = [...this.groups, group].sort((a, b) => a.position - b.position);
            return group;
        } catch {
            return null;
        }
    }

    async update(
        id: string,
        input: Partial<{
            name: string;
            description: string | null;
            tag: string;
            position: number;
        }>,
    ) {
        try {
            const updated = await someDayGroupService.update(id, input);
            this.groups = this.groups.map(g => (g.id === id ? updated : g));
            return updated;
        } catch {
            return null;
        }
    }

    async remove(id: string) {
        try {
            await someDayGroupService.delete(id);
            this.groups = this.groups.filter(g => g.id !== id);
            return true;
        } catch {
            return false;
        }
    }
}

export const someDayGroupStore = new SomeDayGroupStore();
