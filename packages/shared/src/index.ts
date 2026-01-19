/**
 * @alle/shared
 *
 * Shared types, utilities, and constants for the Alle todo app
 */

// Types
export type { Todo, CreateTodoInput, UpdateTodoInput } from './types/todo'
export type { ApiResponse, ApiError, TodoApi } from './types/api'

// Constants
export { TODO_CONSTRAINTS, API_ROUTES } from './constants'

// Adapters
export type { ConfigProvider } from './adapters/config/ConfigProvider'
export { ConfigError } from './adapters/config/ConfigProvider'
