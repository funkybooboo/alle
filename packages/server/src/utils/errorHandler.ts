/**
 * Error handling utilities for server
 *
 * Provides helpers to convert errors into HTTP responses
 */

import type { Logger } from '@alle/shared';
import { AppError, NotFoundError, ValidationError } from '@alle/shared';
import type { HttpResponse } from '../adapters/http/types';

/**
 * Standard error response body shape
 */
export interface ErrorResponseBody {
    error: string;
    code: string;
    details?: unknown;
}

/**
 * Convert an error to an HTTP response
 * Handles both AppError instances and unexpected errors
 */
export function errorToResponse(error: unknown, logger?: Logger): HttpResponse {
    if (error instanceof AppError) {
        if (error.isOperational && logger) {
            logger.warn(error.message, { statusCode: error.statusCode, data: error.data });
        } else if (!error.isOperational && logger) {
            logger.error(error.message, error, { statusCode: error.statusCode });
        }

        const body: ErrorResponseBody = {
            error: error.message,
            code: error.code,
        };
        if (error.data !== undefined) {
            body.details = error.data;
        }

        return {
            status: error.statusCode,
            headers: {},
            body: body,
        };
    }

    if (logger) {
        logger.error('Unexpected error', error);
    }

    const body: ErrorResponseBody = {
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
    };

    return {
        status: 500,
        headers: {},
        body: body,
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
