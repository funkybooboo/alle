/**
 * Error handling utilities for server
 *
 * Provides helpers to convert errors into HTTP responses
 */

import type { Logger } from '@alle/shared';
import { AppError } from '@alle/shared';
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

export {
    createNotFoundError as notFoundError,
    createValidationError as validationError,
} from '@alle/shared';
