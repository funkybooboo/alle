import type { CreateTaskInput, Task, UpdateTaskInput } from '@alle/shared';
import { container } from '$lib/container';
import { type TaskQueryParams, TaskService } from '$lib/services/taskService';

const taskService = new TaskService(container.httpClient);

class TaskStore {
    tasks = $state<Task[]>([]);
    loading = $state(false);
    error = $state<string | null>(null);
    #fetchPromise: Promise<void> | null = null;

    get scheduledTasks() {
        return this.tasks.filter(t => t.date !== null && !t.completed);
    }

    get completedTasks() {
        return this.tasks.filter(t => t.completed);
    }

    get somedayTasks() {
        return this.tasks.filter(t => t.date === null);
    }

    async fetchAll(params?: TaskQueryParams) {
        if (this.#fetchPromise) return this.#fetchPromise;
        this.loading = true;
        this.error = null;
        this.#fetchPromise = (async () => {
            try {
                const tasks = await taskService.getAll(params);
                this.tasks = tasks;
                this.loading = false;
                this.error = null;
            } catch (e) {
                this.loading = false;
                this.error = e instanceof Error ? e.message : 'Failed to fetch tasks';
            } finally {
                this.#fetchPromise = null;
            }
        })();
        return this.#fetchPromise;
    }

    async create(input: CreateTaskInput): Promise<Task | null> {
        try {
            const task = await taskService.create(input);
            this.tasks = [...this.tasks, task];
            return task;
        } catch (e) {
            this.error = e instanceof Error ? e.message : 'Failed to create task';
            return null;
        }
    }

    async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
        const idx = this.tasks.findIndex(t => t.id === id);
        const prev = idx >= 0 ? this.tasks[idx] : null;

        if (prev) {
            const optimistic = { ...prev, ...input, updatedAt: new Date().toISOString() };
            this.tasks = this.tasks.map(t => (t.id === id ? optimistic : t));
        }

        try {
            const task = await taskService.update(id, input);
            this.tasks = this.tasks.map(t => (t.id === id ? task : t));
            return task;
        } catch (e) {
            if (prev) {
                this.tasks = this.tasks.map(t => (t.id === id ? prev : t));
            }
            this.error = e instanceof Error ? e.message : 'Failed to update task';
            return null;
        }
    }

    async remove(id: string): Promise<boolean> {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return false;

        this.tasks = this.tasks.filter(t => t.id !== id);

        try {
            await taskService.delete(id);
            return true;
        } catch (e) {
            this.tasks = [...this.tasks, task];
            this.error = e instanceof Error ? e.message : 'Failed to delete task';
            return false;
        }
    }

    restore(task: Task) {
        this.tasks = [...this.tasks, task];
    }
}

export const taskStore = new TaskStore();

export function getTasksByDate(tasks: Task[]): Map<string, Task[]> {
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
            const key = task.date ?? '__someday__';
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
            const key = task.date ?? '__someday__';
            const group = map.get(key) ?? [];
            group.push(task);
            placed.add(task.id);
            map.set(key, group);
        }
    }

    return map;
}
