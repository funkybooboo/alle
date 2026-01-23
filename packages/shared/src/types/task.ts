/**
 * Core Task type
 */
export interface Task {
    id: string;
    text: string;
    completed: boolean;
    date: string; // ISO 8601 date string
    createdAt: string;
    updatedAt: string;
}

/**
 * Task without server-managed fields (for creation)
 */
export type CreateTaskInput = Pick<Task, 'text' | 'date'>;

/**
 * Partial task for updates
 */
export type UpdateTaskInput = Partial<Pick<Task, 'text' | 'completed' | 'date'>>;
