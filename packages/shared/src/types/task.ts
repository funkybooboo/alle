/**
 * Core Task type — the primary entity in Alle
 */
export interface Task {
    id: string;
    text: string;
    notes: string | null;
    completed: boolean;
    date: string | null;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    parentId: string | null;
    rolloverEnabled: boolean;
    someDayGroupId: string | null;
    position: number | null;
    state: 'ready' | 'scheduled' | 'done' | null;
    recurringTaskId: string | null;
    instanceDate: string | null;
    originalScheduledDate: string | null;
    daysLate: number;
    dependsOn: string | null;
    startTime: string | null;
    endTime: string | null;
    reminder: { time: string; channels: ('push' | 'email')[] } | null;
    deletedAt: string | null;
}

/**
 * Input for creating a new task.
 *
 * `recurringTaskId` and `instanceDate` are server-managed but can be set by
 * server-internal callers (e.g. RecurringTaskService) to link a task to its
 * recurring template. They are NOT exposed on the public Zod
 * `CreateTaskSchema`, so `POST /api/tasks` clients can't inject them; the
 * route parses through Zod first, which strips unknown keys.
 *
 * The remaining server-managed fields (id, completed, createdAt, updatedAt,
 * originalScheduledDate, daysLate) are always set by the repository.
 */
export type CreateTaskInput = {
    text: string;
    date: string | null;
    notes?: string | null;
    tags?: string[];
    parentId?: string | null;
    someDayGroupId?: string | null;
    rolloverEnabled?: boolean;
    position?: number | null;
    state?: 'ready' | 'scheduled' | 'done' | null;
    startTime?: string | null;
    endTime?: string | null;
    reminder?: { time: string; channels: ('push' | 'email')[] } | null;
    /** Links this task to its recurring template (server-internal only). */
    recurringTaskId?: string | null;
    /** The date this recurrence was scheduled for (server-internal only). */
    instanceDate?: string | null;
};

/**
 * Input for updating an existing task.
 * Server-managed fields and immutable fields are excluded.
 */
export type UpdateTaskInput = Partial<{
    text: string;
    notes: string | null;
    completed: boolean;
    date: string | null;
    tags: string[];
    parentId: string | null;
    someDayGroupId: string | null;
    rolloverEnabled: boolean;
    position: number | null;
    state: 'ready' | 'scheduled' | 'done' | null;
    startTime: string | null;
    endTime: string | null;
    reminder: { time: string; channels: ('push' | 'email')[] } | null;
}>;

/**
 * Returns true if the value is a valid "HH:MM" time string, or null (all-day).
 */
export function isValidTimeString(t: string | null): boolean {
    if (t === null) return true;
    if (!/^\d{2}:\d{2}$/.test(t)) return false;
    const [hourStr, minStr] = t.split(':');
    const hours = Number(hourStr);
    const minutes = Number(minStr);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Returns true if the time range is valid.
 * Either value being null means no constraint (all-day or open-ended).
 * When both are present, endTime must be >= startTime.
 */
export function isValidTimeRange(start: string | null, end: string | null): boolean {
    if (start === null || end === null) return true;
    return end >= start;
}
