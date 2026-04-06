/**
 * How often a recurring task repeats
 */
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * RecurringTask — a template that generates task instances on a schedule
 */
export interface RecurringTask {
    id: string;
    text: string;
    notes: string | null;
    tags: string[];
    frequency: RecurringFrequency;
    interval: number; // e.g. every 2 weeks → frequency: 'weekly', interval: 2
    dayOfWeek: number | null; // 0–6 for weekly recurrence
    dayOfMonth: number | null; // 1–31 for monthly recurrence
    startDate: string;
    endDate: string | null;
    projectId: string | null;
    rolloverEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Streak and completion stats for a recurring task
 */
export interface RecurringTaskStats {
    recurringTaskId: string;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    lastCompletedDate: string | null;
}

/**
 * Input for creating a recurring task template
 */
export type CreateRecurringTaskInput = {
    text: string;
    frequency: RecurringFrequency;
    startDate: string;
    notes?: string | null;
    tags?: string[];
    interval?: number;
    dayOfWeek?: number | null;
    dayOfMonth?: number | null;
    endDate?: string | null;
    projectId?: string | null;
    rolloverEnabled?: boolean;
};

/**
 * Input for updating a recurring task template
 */
export type UpdateRecurringTaskInput = Partial<
    Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>
>;
