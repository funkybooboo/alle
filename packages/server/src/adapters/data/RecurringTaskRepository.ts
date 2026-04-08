import type {
    CreateRecurringTaskInput,
    RecurringTask,
    RecurringTaskStats,
    UpdateRecurringTaskInput,
} from '@alle/shared';

/**
 * Repository interface for RecurringTask persistence
 */
export interface RecurringTaskRepository {
    findAll(): Promise<RecurringTask[]>;
    findById(id: string): Promise<RecurringTask | null>;
    create(input: CreateRecurringTaskInput): Promise<RecurringTask>;
    update(id: string, input: UpdateRecurringTaskInput): Promise<RecurringTask | null>;
    delete(id: string): Promise<boolean>;
    findStats(recurringTaskId: string): Promise<RecurringTaskStats | null>;
    upsertStats(stats: RecurringTaskStats): Promise<void>;
}
