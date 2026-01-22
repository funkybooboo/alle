/**
 * Repository interface for Task persistence
 *
 * This interface defines the contract for task data access.
 * Implementations can be in-memory, SQL, NoSQL, etc.
 *
 * Following the Repository pattern, this abstraction allows us to:
 * - Swap database implementations without changing business logic
 * - Test with mock repositories
 * - Keep domain logic separate from data access
 */

import type { Task, CreateTaskInput, UpdateTaskInput } from '@alle/shared'

/**
 * Task repository interface
 */
export interface TaskRepository {
  /**
   * Get all tasks
   */
  findAll(): Promise<Task[]>

  /**
   * Get tasks by date
   * @param date - ISO 8601 date string (YYYY-MM-DD)
   */
  findByDate(date: string): Promise<Task[]>

  /**
   * Get a single task by ID
   * @param id - Task ID
   * @returns Task if found, null otherwise
   */
  findById(id: string): Promise<Task | null>

  /**
   * Create a new task
   * @param input - Task creation data
   * @returns Created task with generated ID and timestamps
   */
  create(input: CreateTaskInput): Promise<Task>

  /**
   * Update an existing task
   * @param id - Task ID
   * @param input - Fields to update
   * @returns Updated task if found, null otherwise
   */
  update(id: string, input: UpdateTaskInput): Promise<Task | null>

  /**
   * Delete a task
   * @param id - Task ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete all tasks (useful for testing)
   */
  deleteAll(): Promise<void>
}

/**
 * Repository error for data access issues
 */
export class RepositoryError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'RepositoryError'
  }
}
