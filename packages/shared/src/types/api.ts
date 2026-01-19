/**
 * API Request and Response types
 */

import { Todo, CreateTodoInput, UpdateTodoInput } from './todo'

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/**
 * API error response
 */
export interface ApiError {
  error: string
  message: string
  statusCode: number
}

/**
 * Todo API endpoints
 */
export interface TodoApi {
  // GET /api/todos
  listTodos: {
    response: ApiResponse<Todo[]>
  }

  // GET /api/todos/:id
  getTodo: {
    response: ApiResponse<Todo>
  }

  // POST /api/todos
  createTodo: {
    request: CreateTodoInput
    response: ApiResponse<Todo>
  }

  // PUT /api/todos/:id
  updateTodo: {
    request: UpdateTodoInput
    response: ApiResponse<Todo>
  }

  // DELETE /api/todos/:id
  deleteTodo: {
    response: ApiResponse<{ id: string }>
  }
}
