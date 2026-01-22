/**
 * API Request and Response types
 */

import { Task, CreateTaskInput, UpdateTaskInput } from './task'

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
  message: string
}

/**
 * Task API endpoints
 */
export interface TaskApi {
  // GET /api/tasks
  listTasks: {
    response: ApiResponse<Task[]>
  }

  // GET /api/tasks/:id
  getTask: {
    response: ApiResponse<Task>
  }

  // POST /api/tasks
  createTask: {
    request: CreateTaskInput
    response: ApiResponse<Task>
  }

  // PUT /api/tasks/:id
  updateTask: {
    request: UpdateTaskInput
    response: ApiResponse<Task>
  }

  // DELETE /api/tasks/:id
  deleteTask: {
    response: ApiResponse<{ id: string }>
  }
}
