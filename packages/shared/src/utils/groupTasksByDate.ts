import { SOMEDAY_KEY } from '../constants';
import type { Task } from '../types/task';

export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
    const map = new Map<string, Task[]>();
    const sorted = [...tasks].sort((a, b) => {
        const posA = a.position ?? Infinity;
        const posB = b.position ?? Infinity;
        if (posA !== posB) return posA - posB;
        return a.createdAt.localeCompare(b.createdAt);
    });
    const placed = new Set<string>();

    for (const task of sorted) {
        if (task.parentId === null) {
            const key = task.date ?? SOMEDAY_KEY;
            const group = map.get(key) ?? [];
            group.push(task);
            placed.add(task.id);
            const children = sorted.filter(c => c.parentId === task.id);
            for (const child of children) {
                group.push(child);
                placed.add(child.id);
            }
            map.set(key, group);
        }
    }

    for (const task of sorted) {
        if (!placed.has(task.id)) {
            const key = task.date ?? SOMEDAY_KEY;
            const group = map.get(key) ?? [];
            group.push(task);
            placed.add(task.id);
            map.set(key, group);
        }
    }

    return map;
}
