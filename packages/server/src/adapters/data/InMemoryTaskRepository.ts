/**
 * In-memory implementation of TaskRepository
 *
 * This is a simple in-memory store using a Map for fast lookups.
 * Data is lost when the server restarts.
 *
 * Benefits:
 * - No external dependencies or database setup needed
 * - Fast for development and testing
 * - Easy to swap for PostgreSQL/MongoDB implementation later
 *
 * To switch to a real database, just:
 * 1. Create PostgresTaskRepository.ts implementing TaskRepository
 * 2. Change one line in container.ts
 * 3. Business logic stays unchanged
 */

import type { CreateTaskInput, DateProvider, Task, UpdateTaskInput } from '@alle/shared';
import type { TaskRepository } from './TaskRepository';

/**
 * In-memory task repository using a Map
 */
export class InMemoryTaskRepository implements TaskRepository {
    private tasks: Map<string, Task> = new Map();
    private idCounter = 0;

    constructor(private dateProvider: DateProvider) {}

    /**
     * Get all tasks
     */
    async findAll(): Promise<Task[]> {
        return Array.from(this.tasks.values()).sort((a, b) => {
            // Sort by date, then by creation time
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.createdAt.localeCompare(b.createdAt);
        });
    }

    /**
     * Get tasks by date
     */
    async findByDate(date: string): Promise<Task[]> {
        return Array.from(this.tasks.values())
            .filter(task => task.date === date)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    /**
     * Get a single task by ID
     */
    async findById(id: string): Promise<Task | null> {
        return this.tasks.get(id) ?? null;
    }

    /**
     * Create a new task
     */
    async create(input: CreateTaskInput): Promise<Task> {
        const now = this.dateProvider.timestamp();
        const id = (++this.idCounter).toString();

        const task: Task = {
            id,
            text: input.text,
            completed: false,
            date: input.date,
            createdAt: now,
            updatedAt: now,
        };

        this.tasks.set(id, task);
        return task;
    }

    /**
     * Update an existing task
     */
    async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
        const existing = this.tasks.get(id);
        if (!existing) {
            return null;
        }

        const updated: Task = {
            ...existing,
            ...input,
            updatedAt: this.dateProvider.timestamp(),
        };

        this.tasks.set(id, updated);
        return updated;
    }

    /**
     * Delete a task
     */
    async delete(id: string): Promise<boolean> {
        return this.tasks.delete(id);
    }

    /**
     * Delete all tasks
     */
    async deleteAll(): Promise<void> {
        this.tasks.clear();
        this.idCounter = 0;
    }
}
