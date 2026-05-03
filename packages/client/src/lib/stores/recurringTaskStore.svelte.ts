import type { RecurringTask } from '@alle/shared';
import { container } from '$lib/container';
import { RecurringTaskService } from '$lib/services/recurringTaskService';

const recurringTaskService = new RecurringTaskService(container.httpClient);

class RecurringTaskStore {
    tasks = $state<RecurringTask[]>([]);

    async fetchAll() {
        try {
            const tasks = await recurringTaskService.getAll();
            this.tasks = tasks;
        } catch {
            // Keep empty state
        }
    }

    async create(input: {
        text: string;
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        startDate: string;
        notes?: string | null;
        tags?: string[];
        interval?: number;
        dayOfWeek?: number | null;
        dayOfMonth?: number | null;
        endDate?: string | null;
        projectId?: string | null;
        rolloverEnabled?: boolean;
    }) {
        try {
            const task = await recurringTaskService.create(input);
            this.tasks = [...this.tasks, task];
            return task;
        } catch {
            return null;
        }
    }

    async update(
        id: string,
        input: Partial<Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>>,
    ) {
        try {
            const updated = await recurringTaskService.update(id, input);
            this.tasks = this.tasks.map(t => (t.id === id ? updated : t));
            return updated;
        } catch {
            return null;
        }
    }

    async remove(id: string) {
        try {
            await recurringTaskService.delete(id);
            this.tasks = this.tasks.filter(t => t.id !== id);
            return true;
        } catch {
            return false;
        }
    }
}

export const recurringTaskStore = new RecurringTaskStore();
