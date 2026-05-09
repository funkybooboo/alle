import type { Task } from '../types/task';

export function isOverdue(task: Task, today: string): boolean {
    if (task.completed || !task.date) return false;
    return task.date < today;
}
