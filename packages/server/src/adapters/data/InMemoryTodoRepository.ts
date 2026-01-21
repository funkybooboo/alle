/**
 * In-memory implementation of TodoRepository
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
 * 1. Create PostgresTodoRepository.ts implementing TodoRepository
 * 2. Change one line in container.ts
 * 3. Business logic stays unchanged
 */

import { DateUtils, type Todo, type CreateTodoInput, type UpdateTodoInput, type TodoRepository } from '@alle/shared'

/**
 * In-memory todo repository using a Map
 */
export class InMemoryTodoRepository implements TodoRepository {
  private todos: Map<string, Todo> = new Map()
  private idCounter = 0

  /**
   * Get all todos
   */
  async findAll(): Promise<Todo[]> {
    return Array.from(this.todos.values()).sort((a, b) => {
      // Sort by date, then by creation time
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.createdAt.localeCompare(b.createdAt)
    })
  }

  /**
   * Get todos by date
   */
  async findByDate(date: string): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter(todo => todo.date === date)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  /**
   * Get a single todo by ID
   */
  async findById(id: string): Promise<Todo | null> {
    return this.todos.get(id) ?? null
  }

  /**
   * Create a new todo
   */
  async create(input: CreateTodoInput): Promise<Todo> {
    const now = DateUtils.timestamp()
    const id = (++this.idCounter).toString()

    const todo: Todo = {
      id,
      text: input.text,
      completed: false,
      date: input.date,
      createdAt: now,
      updatedAt: now,
    }

    this.todos.set(id, todo)
    return todo
  }

  /**
   * Update an existing todo
   */
  async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    const existing = this.todos.get(id)
    if (!existing) {
      return null
    }

    const updated: Todo = {
      ...existing,
      ...input,
      updatedAt: DateUtils.timestamp(),
    }

    this.todos.set(id, updated)
    return updated
  }

  /**
   * Delete a todo
   */
  async delete(id: string): Promise<boolean> {
    return this.todos.delete(id)
  }

  /**
   * Delete all todos
   */
  async deleteAll(): Promise<void> {
    this.todos.clear()
    this.idCounter = 0
  }
}
