/**
 * Repository interface for Todo persistence
 *
 * This interface defines the contract for todo data access.
 * Implementations can be in-memory, SQL, NoSQL, etc.
 *
 * Following the Repository pattern, this abstraction allows us to:
 * - Swap database implementations without changing business logic
 * - Test with mock repositories
 * - Keep domain logic separate from data access
 */

import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../types/todo'

/**
 * Todo repository interface
 */
export interface TodoRepository {
  /**
   * Get all todos
   */
  findAll(): Promise<Todo[]>

  /**
   * Get todos by date
   * @param date - ISO 8601 date string (YYYY-MM-DD)
   */
  findByDate(date: string): Promise<Todo[]>

  /**
   * Get a single todo by ID
   * @param id - Todo ID
   * @returns Todo if found, null otherwise
   */
  findById(id: string): Promise<Todo | null>

  /**
   * Create a new todo
   * @param input - Todo creation data
   * @returns Created todo with generated ID and timestamps
   */
  create(input: CreateTodoInput): Promise<Todo>

  /**
   * Update an existing todo
   * @param id - Todo ID
   * @param input - Fields to update
   * @returns Updated todo if found, null otherwise
   */
  update(id: string, input: UpdateTodoInput): Promise<Todo | null>

  /**
   * Delete a todo
   * @param id - Todo ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete all todos (useful for testing)
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
