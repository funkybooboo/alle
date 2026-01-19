/**
 * Core Todo type
 */
export interface Todo {
  id: string
  text: string
  completed: boolean
  date: string // ISO 8601 date string
  createdAt: string
  updatedAt: string
}

/**
 * Todo without server-managed fields (for creation)
 */
export type CreateTodoInput = Pick<Todo, 'text' | 'date'>

/**
 * Partial todo for updates
 */
export type UpdateTodoInput = Partial<Pick<Todo, 'text' | 'completed' | 'date'>>
