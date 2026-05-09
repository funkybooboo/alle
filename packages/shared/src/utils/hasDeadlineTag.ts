import type { Task } from '../types/task';

export function hasDeadlineTag(task: Task): boolean {
    return task.tags.includes('deadline');
}
