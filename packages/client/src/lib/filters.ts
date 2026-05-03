import type { Task } from '@alle/shared';

export interface FilterState {
    tags: string[];
    projectId: string | null;
    priority: string | null;
    showCompleted: boolean;
}

export function applyFilters(tasks: Task[], filters: FilterState): Task[] {
    let result = tasks;

    if (filters.tags.length > 0) {
        result = result.filter(t => filters.tags.some(tag => t.tags.includes(tag)));
    }

    if (filters.projectId) {
        result = result.filter(t => t.projectId === filters.projectId);
    }

    if (filters.priority) {
        const priority = filters.priority;
        result = result.filter(t => t.tags.includes(priority));
    }

    if (!filters.showCompleted) {
        result = result.filter(t => !t.completed);
    }

    return result;
}
