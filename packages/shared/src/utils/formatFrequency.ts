import type { RecurringTask } from '../types/recurringTask';

export function formatFrequency(task: RecurringTask): string {
    if (task.interval > 1) {
        return `every ${task.interval} ${task.frequency.replace(/ly$/, '').trim()}`;
    }
    return task.frequency;
}
