import type {
    CreateRecurringTaskInput,
    DateProvider,
    RecurringTask,
    RecurringTaskStats,
    UpdateRecurringTaskInput,
} from '@alle/shared';
import type { RecurringTaskRepository } from './RecurringTaskRepository';

export class InMemoryRecurringTaskRepository implements RecurringTaskRepository {
    private tasks: Map<string, RecurringTask> = new Map();
    private stats: Map<string, RecurringTaskStats> = new Map();
    private idCounter = 0;

    constructor(private dateProvider: DateProvider) {}

    async findAll(): Promise<RecurringTask[]> {
        return Array.from(this.tasks.values()).sort((a, b) =>
            a.createdAt.localeCompare(b.createdAt),
        );
    }

    async findById(id: string): Promise<RecurringTask | null> {
        return this.tasks.get(id) ?? null;
    }

    async create(input: CreateRecurringTaskInput): Promise<RecurringTask> {
        const now = this.dateProvider.timestamp();
        const id = (++this.idCounter).toString();
        const task: RecurringTask = {
            id,
            text: input.text,
            notes: input.notes ?? null,
            tags: input.tags ?? [],
            frequency: input.frequency,
            interval: input.interval ?? 1,
            dayOfWeek: input.dayOfWeek ?? null,
            dayOfMonth: input.dayOfMonth ?? null,
            startDate: input.startDate,
            endDate: input.endDate ?? null,
            projectId: input.projectId ?? null,
            rolloverEnabled: input.rolloverEnabled ?? true,
            createdAt: now,
            updatedAt: now,
        };
        this.tasks.set(id, task);
        return task;
    }

    async update(id: string, input: UpdateRecurringTaskInput): Promise<RecurringTask | null> {
        const existing = this.tasks.get(id);
        if (!existing) return null;
        const updated: RecurringTask = {
            ...existing,
            ...input,
            updatedAt: this.dateProvider.timestamp(),
        };
        this.tasks.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return this.tasks.delete(id);
    }

    async deleteAll(): Promise<void> {
        this.tasks.clear();
        this.stats.clear();
        this.idCounter = 0;
    }

    async findStats(recurringTaskId: string): Promise<RecurringTaskStats | null> {
        return this.stats.get(recurringTaskId) ?? null;
    }

    async upsertStats(stats: RecurringTaskStats): Promise<void> {
        this.stats.set(stats.recurringTaskId, stats);
    }
}
