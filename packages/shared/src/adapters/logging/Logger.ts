/**
 * Logger interface for application logging
 *
 * This interface defines the contract for logging operations.
 * Implementations can be console-based, file-based, or use external
 * logging services (Sentry, DataDog, etc.)
 *
 * Following the adapter pattern, this abstraction allows us to:
 * - Swap logging implementations without changing business logic
 * - Test with mock loggers
 * - Add structured logging, log levels, or external services later
 */

/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Structured log context (optional metadata)
 */
export interface LogContext {
  [key: string]: unknown
}

/**
 * Logger interface
 */
export interface Logger {
  /**
   * Log a debug message (for development)
   * @param message - Log message
   * @param context - Optional context/metadata
   */
  debug(message: string, context?: LogContext): void

  /**
   * Log an info message (general information)
   * @param message - Log message
   * @param context - Optional context/metadata
   */
  info(message: string, context?: LogContext): void

  /**
   * Log a warning message (something unexpected but not critical)
   * @param message - Log message
   * @param context - Optional context/metadata
   */
  warn(message: string, context?: LogContext): void

  /**
   * Log an error message (something went wrong)
   * @param message - Log message
   * @param error - Optional error object
   * @param context - Optional context/metadata
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void
}
