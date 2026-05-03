/**
 * Repository interface for Task persistence
 *
 * This interface defines the contract for task data access.
 * Implementations can be in-memory, SQL, NoSQL, etc.
 *
 * Following the Repository pattern, this abstraction allows us to:
 * - Swap database implementations without changing business logic
 * - Test with in-memory or SQLite implementations
 * - Keep domain logic separate from data access
 */

import type { CreateTaskInput, Task, UpdateTaskInput } from '@alle/shared';

/**
 * Task repository interface
 */
export interface TaskRepository {
    findAll(): Promise<Task[]>;
    findByDate(date: string): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(input: CreateTaskInput): Promise<Task>;
    update(id: string, input: UpdateTaskInput): Promise<Task | null>;
    delete(id: string): Promise<boolean>;
    findSomeday(): Promise<Task[]>;
    findBySomeDayGroup(groupId: string): Promise<Task[]>;
    findChildren(parentId: string): Promise<Task[]>;
    findByTags(tags: string[]): Promise<Task[]>;
    forceDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<Task | null>;
    findDeleted(maxAgeDays?: number): Promise<Task[]>;
    purgeDeleted(maxAgeDays?: number): Promise<number>;
}

/**
 * Repository error for data access issues
 */
export class RepositoryError extends Error {
    public readonly errorCause?: unknown;

    constructor(message: string, errorCause?: unknown) {
        super(message);
        this.name = 'RepositoryError';
        this.errorCause = errorCause;
    }
}
