/**
 * @alle/shared
 *
 * Shared types, utilities, and constants for the Alle task app
 */

// Adapters - Config
export type { ConfigProvider } from './adapters/config/ConfigProvider';
export { ConfigError } from './adapters/config/ConfigProvider';
// Adapters - Date
export type { DateProvider } from './adapters/date/DateProvider';
export { DateProviderError } from './adapters/date/DateProvider';
export { NativeDateProvider } from './adapters/date/NativeDateProvider';
export { FetchHttpClient } from './adapters/http/FetchHttpClient';
// Adapters - HTTP Client
export type { HttpClient, RequestOptions } from './adapters/http/HttpClient';
export { HttpClientError } from './adapters/http/HttpClient';
export { ConsoleLogger } from './adapters/logging/ConsoleLogger';
// Adapters - Logging
export type { LogContext, Logger } from './adapters/logging/Logger';
export { LogLevel } from './adapters/logging/Logger';
// Constants
export { API_ROUTES, TASK_CONSTRAINTS } from './constants';
// Errors
export {
    AppError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from './errors/AppError';
export type { ApiError, ApiResponse, TaskApi } from './types/api';
// Types
export type { CreateTaskInput, Task, UpdateTaskInput } from './types/task';
