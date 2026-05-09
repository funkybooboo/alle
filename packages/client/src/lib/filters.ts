import type { ActiveFilters, Task } from '@alle/shared';

export function applyFilters(tasks: Task[], filters: ActiveFilters): Task[] {
    let result = tasks;

    if (filters.tags.length > 0) {
        result = result.filter(t => filters.tags.some(tag => t.tags.includes(tag)));
    }

    if (!filters.showCompleted) {
        result = result.filter(t => !t.completed);
    }

    return result;
}
