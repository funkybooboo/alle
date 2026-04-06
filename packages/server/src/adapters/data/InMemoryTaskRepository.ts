/**
 * In-memory implementation of TaskRepository
 *
 * Simple in-memory store using a Map for fast lookups.
 * Data is lost when the server restarts — intended for development
 * and as the baseline before the SQLite adapter ships in v0.8.0.
 *
 * To switch to a persistent store:
 * 1. Create SQLiteTaskRepository.ts implementing TaskRepository
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
     * Get all tasks, sorted by date (nulls last) then creation time
     */
    async findAll(): Promise<Task[]> {
        return Array.from(this.tasks.values()).sort((a, b) => {
            if (a.date === null && b.date === null) return a.createdAt.localeCompare(b.createdAt);
            if (a.date === null) return 1;
            if (b.date === null) return -1;
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
     * Get tasks with date: null (Someday / unscheduled)
     */
    async findSomeday(): Promise<Task[]> {
        return Array.from(this.tasks.values())
            .filter(task => task.date === null)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    /**
     * Get tasks belonging to a specific Someday group
     */
    async findBySomeDayGroup(groupId: string): Promise<Task[]> {
        return Array.from(this.tasks.values())
            .filter(task => task.someDayGroupId === groupId)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    /**
     * Get direct children of a parent task
     */
    async findChildren(parentId: string): Promise<Task[]> {
        return Array.from(this.tasks.values())
            .filter(task => task.parentId === parentId)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    /**
     * Get tasks matching any of the given tags (OR semantics).
     * Returns all tasks when tags array is empty.
     */
    async findByTags(tags: string[]): Promise<Task[]> {
        if (tags.length === 0) return this.findAll();
        return Array.from(this.tasks.values())
            .filter(task => tags.some(t => task.tags.includes(t)))
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    /**
     * Get a single task by ID
     */
    async findById(id: string): Promise<Task | null> {
        return this.tasks.get(id) ?? null;
    }

    /**
     * Create a new task with all fields, using sensible defaults
     */
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
            tags: input.tags ?? [],
            parentId: input.parentId ?? null,
            rolloverEnabled: input.rolloverEnabled ?? false,
            someDayGroupId: input.someDayGroupId ?? null,
            projectId: input.projectId ?? null,
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
