import type {
    CreateRecurringTaskInput,
    RecurringTask,
    UpdateRecurringTaskInput,
} from '@alle/shared';
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

    async create(input: CreateRecurringTaskInput) {
        try {
            const task = await recurringTaskService.create(input);
            this.tasks = [...this.tasks, task];
            return task;
        } catch {
            return null;
        }
    }

    async update(id: string, input: UpdateRecurringTaskInput) {
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
