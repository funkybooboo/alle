import type { CreateTaskInput, Task, UpdateTaskInput, WsServerMessage } from '@alle/shared';
import { container } from '$lib/container';
import { type TaskQueryParams, TaskService } from '$lib/services/taskService';
import { websocketService } from '$lib/services/websocketService';

const taskService = new TaskService(container.httpClient);

class TaskStore {
    tasks = $state<Task[]>([]);
    loading = $state(false);
    error = $state<string | null>(null);
    #fetchPromise: Promise<void> | null = null;
    #messageUnsubscribe: (() => void) | null = null;

    get scheduledTasks() {
        return this.tasks.filter(t => t.date !== null && !t.completed);
    }

    get completedTasks() {
        return this.tasks.filter(t => t.completed);
    }

    get somedayTasks() {
        return this.tasks.filter(t => t.date === null);
    }

    initWebSocket(): void {
        this.#messageUnsubscribe = websocketService.onMessage((message: WsServerMessage) => {
            const myClientId = websocketService.getClientId();
            if (message.originClientId === myClientId) return;

            switch (message.type) {
                case 'task:created':
                    if (message.payload.task) {
                        this.tasks = [...this.tasks, message.payload.task];
                    }
                    break;
                case 'task:updated':
                    if (message.payload.task) {
                        this.tasks = this.tasks.map(t =>
                            t.id === message.payload.task.id ? message.payload.task : t,
                        );
                    }
                    break;
                case 'task:deleted':
                    this.tasks = this.tasks.filter(t => t.id !== message.payload.id);
                    break;
                case 'task:restored':
                    if (message.payload.task) {
                        this.tasks = [...this.tasks, message.payload.task];
                    }
                    break;
            }
        });
    }

    destroyWebSocket(): void {
        this.#messageUnsubscribe?.();
        this.#messageUnsubscribe = null;
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

    async restore(task: Task): Promise<void> {
        this.tasks = [...this.tasks, task];
        try {
            await taskService.restore(task.id);
        } catch (e) {
            this.tasks = this.tasks.filter(t => t.id !== task.id);
            this.error = e instanceof Error ? e.message : 'Failed to restore task';
        }
    }

    async getTrash(): Promise<Task[]> {
        return taskService.getTrash();
    }

    async softDelete(id: string): Promise<boolean> {
        return this.remove(id);
    }

    async restoreFromTrash(id: string): Promise<Task | null> {
        try {
            const task = await taskService.restore(id);
            this.tasks = [...this.tasks, task];
            return task;
        } catch (e) {
            this.error = e instanceof Error ? e.message : 'Failed to restore task';
            return null;
        }
    }

    async purge(): Promise<number> {
        return taskService.purge();
    }
}

export const taskStore = new TaskStore();
