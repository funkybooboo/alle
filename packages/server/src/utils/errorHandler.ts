/**
 * Error handling utilities for server
 *
 * Provides helpers to convert errors into HTTP responses
 */

import type { Logger } from '@alle/shared';
import { type ApiError, AppError, NotFoundError, ValidationError } from '@alle/shared';
import type { HttpResponse } from '../adapters/http/types';

/**
 * Convert an error to an HTTP response
 * Handles both AppError instances and unexpected errors
 */
export function errorToResponse(error: unknown, logger?: Logger): HttpResponse {
    // Handle AppError instances
    if (error instanceof AppError) {
        // Log operational errors as warnings
        if (error.isOperational && logger) {
            logger.warn(error.message, { statusCode: error.statusCode, data: error.data });
        }
        // Log non-operational errors (bugs) as errors
        else if (!error.isOperational && logger) {
            logger.error(error.message, error, { statusCode: error.statusCode });
        }

        const apiError: ApiError = {
            message: error.message,
        };

        return {
            status: error.statusCode,
            headers: {},
            body: { error: apiError },
        };
    }

    // Handle unexpected errors (bugs)
    if (logger) {
        logger.error('Unexpected error', error);
    }

    const apiError: ApiError = {
        message: 'Internal server error',
    };

    return {
        status: 500,
        headers: {},
        body: { error: apiError },
    };
}

/**
 * Create validation error from validation failures
 */
export function validationError(message: string, fields?: Record<string, string>): ValidationError {
    return new ValidationError(message, fields ? { fields } : undefined);
}

/**
 * Create not found error for a resource
 */
export function notFoundError(resource: string, id?: string): NotFoundError {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    return new NotFoundError(message);
}
