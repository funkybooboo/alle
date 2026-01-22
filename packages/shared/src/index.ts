/**
 * @alle/shared
 *
 * Shared types, utilities, and constants for the Alle task app
 */

// Types
export type { Task, CreateTaskInput, UpdateTaskInput } from './types/task'
export type { ApiResponse, ApiError, TaskApi } from './types/api'

// Constants
export { TASK_CONSTRAINTS, API_ROUTES } from './constants'

// Adapters - Config
export type { ConfigProvider } from './adapters/config/ConfigProvider'
export { ConfigError } from './adapters/config/ConfigProvider'

// Adapters - HTTP Client
export type { HttpClient, RequestOptions } from './adapters/http/HttpClient'
export { HttpClientError } from './adapters/http/HttpClient'
export { FetchHttpClient } from './adapters/http/FetchHttpClient'

// Adapters - Logging
export type { Logger, LogContext } from './adapters/logging/Logger'
export { LogLevel } from './adapters/logging/Logger'
export { ConsoleLogger } from './adapters/logging/ConsoleLogger'

// Adapters - Date
export type { DateProvider } from './adapters/date/DateProvider'
export { DateProviderError } from './adapters/date/DateProvider'
export { NativeDateProvider } from './adapters/date/NativeDateProvider'

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
