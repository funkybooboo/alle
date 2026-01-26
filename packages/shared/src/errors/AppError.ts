/**
 * Application error classes
 *
 * These provide a consistent error handling system across the app.
 * All custom errors extend AppError which includes:
 * - statusCode for HTTP responses
 * - isOperational flag to distinguish expected errors from bugs
 * - structured error data for clients
 *
 * Usage:
 * - Server: Catch these errors and convert to HTTP responses
 * - Client: Catch HttpClientError and handle appropriately
 * - Shared: Use for business logic validation
 */

/**
 * JSON representation of an AppError
 */
export interface AppErrorJson {
    name: string;
    message: string;
    statusCode: number;
    data?: unknown;
}

/**
 * Base application error
 * All custom errors should extend this class
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly data?: unknown;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        data?: unknown,
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.data = data;

        // Maintains proper stack trace (only available on V8)
        // We need to narrow Error to include captureStackTrace if it exists
        if (
            typeof (Error as unknown as { captureStackTrace?: CallableFunction })
                .captureStackTrace === 'function'
        ) {
            (
                Error as unknown as {
                    captureStackTrace: (target: object, constructorFn: CallableFunction) => void;
                }
            ).captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Convert error to JSON format for API responses
     */
    toJSON(): AppErrorJson {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            data: this.data,
        };
    }
}

/**
 * Validation error (400)
 * Used when input data fails validation
 */
export class ValidationError extends AppError {
    constructor(message: string, data?: unknown) {
        super(message, 400, true, data);
    }
}

/**
 * Not found error (404)
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', data?: unknown) {
        super(message, 404, true, data);
    }
}

/**
 * Unauthorized error (401)
 * Used when authentication is required but not provided
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Authentication required', data?: unknown) {
        super(message, 401, true, data);
    }
}

/**
 * Forbidden error (403)
 * Used when user is authenticated but lacks permission
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Permission denied', data?: unknown) {
        super(message, 403, true, data);
    }
}

/**
 * Conflict error (409)
 * Used when there's a conflict with existing data (e.g., duplicate)
 */
export class ConflictError extends AppError {
    constructor(message: string, data?: unknown) {
        super(message, 409, true, data);
    }
}

/**
 * Bad request error (400)
 * Used for malformed requests
 */
export class BadRequestError extends AppError {
    constructor(message: string, data?: unknown) {
        super(message, 400, true, data);
    }
}

/**
 * Internal server error (500)
 * Used for unexpected errors (bugs)
 */
export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error', data?: unknown) {
        super(message, 500, false, data); // Not operational - indicates a bug
    }
}
