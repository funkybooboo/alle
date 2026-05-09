import type { CreateTaskInput, DateProvider, Task, UpdateTaskInput } from '@alle/shared';
import { PURGE_RETENTION_DAYS, TASK_DEFAULTS } from '@alle/shared';
import type { TaskRepository } from './TaskRepository';

export class InMemoryTaskRepository implements TaskRepository {
    private tasks: Map<string, Task> = new Map();
    private idCounter = 0;

    constructor(private dateProvider: DateProvider) {}

    async findAll(): Promise<Task[]> {
        return this.activeTasks().sort((a, b) => {
            if (a.date === null && b.date === null) return a.createdAt.localeCompare(b.createdAt);
            if (a.date === null) return 1;
            if (b.date === null) return -1;
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.createdAt.localeCompare(b.createdAt);
        });
    }

    async findByDate(date: string): Promise<Task[]> {
        return this.activeTasks()
            .filter(task => task.date === date)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    async findSomeday(): Promise<Task[]> {
        return this.activeTasks()
            .filter(task => task.date === null)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    async findBySomeDayGroup(groupId: string): Promise<Task[]> {
        return this.activeTasks()
            .filter(task => task.someDayGroupId === groupId)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    async findChildren(parentId: string): Promise<Task[]> {
        return this.activeTasks()
            .filter(task => task.parentId === parentId)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    async findByTags(tags: string[]): Promise<Task[]> {
        if (tags.length === 0) return this.findAll();
        return this.activeTasks()
            .filter(task => tags.some(t => task.tags.includes(t)))
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    async findById(id: string): Promise<Task | null> {
        const task = this.tasks.get(id);
        if (!task || task.deletedAt !== null) return null;
        return task;
    }

    async create(input: CreateTaskInput): Promise<Task> {
        const now = this.dateProvider.timestamp();
        const id = (++this.idCounter).toString();

        const task: Task = {
            id,
            text: input.text,
            notes: input.notes ?? null,
            completed: false,
            date: input.date,
            createdAt: now,
            updatedAt: now,
            tags: input.tags ?? [...TASK_DEFAULTS.tags],
            parentId: input.parentId ?? null,
            rolloverEnabled: input.rolloverEnabled ?? TASK_DEFAULTS.rolloverEnabled,
            someDayGroupId: input.someDayGroupId ?? null,
            position: input.position ?? null,
            state: input.state ?? null,
            recurringTaskId: null,
            instanceDate: null,
            originalScheduledDate: null,
            daysLate: 0,
            dependsOn: null,
            startTime: input.startTime ?? null,
            endTime: input.endTime ?? null,
            reminder: input.reminder ?? null,
            deletedAt: null,
        };

        this.tasks.set(id, task);
        return task;
    }

    async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
        const existing = this.tasks.get(id);
        if (!existing || existing.deletedAt !== null) return null;

        const updated: Task = {
            ...existing,
            ...input,
            updatedAt: this.dateProvider.timestamp(),
        };

        this.tasks.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const existing = this.tasks.get(id);
        if (!existing) return false;
        if (existing.deletedAt !== null) return false;

        const softDeleted: Task = {
            ...existing,
            deletedAt: this.dateProvider.timestamp(),
            updatedAt: this.dateProvider.timestamp(),
        };

        this.tasks.set(id, softDeleted);
        return true;
    }

    async forceDelete(id: string): Promise<boolean> {
        return this.tasks.delete(id);
    }

    async restore(id: string): Promise<Task | null> {
        const existing = this.tasks.get(id);
        if (!existing || existing.deletedAt === null) return null;

        const restored: Task = {
            ...existing,
            deletedAt: null,
            updatedAt: this.dateProvider.timestamp(),
        };

        this.tasks.set(id, restored);
        return restored;
    }

    async findDeleted(maxAgeDays: number = PURGE_RETENTION_DAYS): Promise<Task[]> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - maxAgeDays);

        return Array.from(this.tasks.values())
            .filter(task => task.deletedAt !== null)
            .sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? ''));
    }

    async purgeDeleted(maxAgeDays: number = PURGE_RETENTION_DAYS): Promise<number> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - maxAgeDays);
        const cutoffStr = cutoff.toISOString();

        let purged = 0;
        for (const [id, task] of this.tasks) {
            if (task.deletedAt !== null && task.deletedAt < cutoffStr) {
                this.tasks.delete(id);
                purged++;
            }
        }
        return purged;
    }

    async deleteAll(): Promise<void> {
        this.tasks.clear();
        this.idCounter = 0;
    }

    private activeTasks(): Task[] {
        return Array.from(this.tasks.values()).filter(t => t.deletedAt === null);
    }
}
