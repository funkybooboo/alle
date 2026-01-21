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

// Adapters - Config
export type { ConfigProvider } from './adapters/config/ConfigProvider'
export { ConfigError } from './adapters/config/ConfigProvider'

// Adapters - HTTP Client
export type { HttpClient, RequestOptions } from './adapters/http/HttpClient'
export { HttpClientError } from './adapters/http/HttpClient'
export { FetchHttpClient } from './adapters/http/FetchHttpClient'

// Adapters - Data Repository
export type { TodoRepository } from './adapters/data/TodoRepository'
export { RepositoryError } from './adapters/data/TodoRepository'

// Adapters - Logging
export type { Logger, LogContext } from './adapters/logging/Logger'
export { LogLevel } from './adapters/logging/Logger'
export { ConsoleLoggerBase } from './adapters/logging/ConsoleLoggerBase'

// Utilities
export * as DateUtils from './utils/date'

// Errors
export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  InternalServerError,
} from './errors/AppError'
