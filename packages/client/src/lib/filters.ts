import type { ActiveFilters, Task } from '@alle/shared';

/**
 * Apply tag filters to a task list. Completed tasks are NEVER hidden — they
 * stay visible (just struck-through) so the day's full state is always on
 * screen. Incomplete past-day tasks roll over to the next day via
 * auto-rollover, so there's no overdue state to hide either.
 */
export function applyFilters(tasks: Task[], filters: ActiveFilters): Task[] {
    if (filters.tags.length === 0) {
        return tasks;
    }
    return tasks.filter(t => filters.tags.some(tag => t.tags.includes(tag)));
}
