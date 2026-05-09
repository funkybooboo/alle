/**
 * Shared route utilities
 *
 * Centralises the withErrorHandling wrapper and successResponse builder
 * so every route file doesn't need its own copy.
 */

import { type ApiResponse, CONTENT_TYPE_TEXT, type Logger } from '@alle/shared';
import type { HttpRequest, HttpResponse } from '../adapters/http/types';
import { negotiate } from './contentNegotiation';
import { errorToResponse } from './errorHandler';

export type RouteHandlerFn = (req: HttpRequest) => Promise<HttpResponse>;

/**
 * Wraps a route handler so any thrown error is caught and converted to an
 * appropriate HTTP error response instead of crashing the server.
 */
export function withErrorHandling(handler: RouteHandlerFn, logger: Logger): RouteHandlerFn {
    return async req => {
        try {
            return await handler(req);
        } catch (error) {
            return errorToResponse(error, logger);
        }
    };
}

/**
 * Build a standard JSON success response wrapping `data` in ApiResponse shape.
 */
export function successResponse<T>(data: T, status = 200): HttpResponse {
    const response: ApiResponse<T> = { data };
    return { status, headers: {}, body: response };
}

export function respondNegotiated<T>(
    req: HttpRequest,
    data: T,
    formatAsText: (data: T) => string,
    status = 200,
): HttpResponse {
    if (negotiate(req.headers['accept']) === 'text') {
        return {
            status,
            headers: { 'Content-Type': CONTENT_TYPE_TEXT },
            body: formatAsText(data),
        };
    }
    return successResponse(data, status);
}
