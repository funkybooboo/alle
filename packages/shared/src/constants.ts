/**
 * Shared constants
 */

/**
 * Validation constraints
 */
export const TODO_CONSTRAINTS = {
  MAX_TEXT_LENGTH: 500,
  MIN_TEXT_LENGTH: 1,
} as const

/**
 * API routes
 */
export const API_ROUTES = {
  TODOS: '/api/todos',
  TODO_BY_ID: (id: string) => `/api/todos/${id}`,
  HEALTH: '/api/health',
} as const
