/**
 * Alle Task App - API Server
 *
 * Now using adapter pattern for HTTP server abstraction.
 * This makes it trivial to swap from Bun → Node.js/Express/Fastify
 * by changing one line in the container.
 *
 * No more giant fetch handler - routes are registered individually.
 */

import {
    API_ROUTES,
    type ApiResponse,
    BadRequestError,
    type CreateTaskInput,
    TASK_CONSTRAINTS,
    type UpdateTaskInput,
} from '@alle/shared';
import type { HttpRequest, HttpResponse } from './adapters/http/types';
import { container } from './container';
import { errorToResponse, notFoundError, validationError } from './utils/errorHandler';

// Load configuration
const PORT = container.config.getNumber('PORT', 4000);

// Get dependencies from container
const server = container.httpServer;
const taskRepo = container.taskRepository;
const logger = container.logger;

/**
 * Helper functions
 */

// Wrap route handler with automatic error handling
type RouteHandlerFn = (req: HttpRequest) => Promise<HttpResponse>;
function withErrorHandling(handler: RouteHandlerFn): RouteHandlerFn {
    return async (req: HttpRequest) => {
        try {
            return await handler(req);
        } catch (error) {
            return errorToResponse(error, logger);
        }
    };
}

// Extract ID from URL path like /api/tasks/123
function extractIdFromPath(url: string): string | null {
    const match: RegExpMatchArray | null = url.match(/\/api\/tasks\/([^/?]+)/);
    // With noUncheckedIndexedAccess, match[1] is string | undefined
    // We know the regex has one capture group, so match[1] exists if match is truthy
    return match !== null && match[1] !== undefined ? match[1] : null;
}

// Extract query parameter from URL
function getQueryParam(url: string, param: string): string | null {
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.searchParams.get(param);
}

// Create success response
function successResponse<T>(data: T, status = 200): HttpResponse {
    const response: ApiResponse<T> = { data };
    return {
        status,
        headers: {},
        body: response,
    };
}

/**
 * Register routes
 * Each route is a clean, isolated handler function
 */

// Root endpoint - basic hello world
server.route('GET', '/', async (): Promise<HttpResponse> => {
    return {
        status: 200,
        headers: {},
        body: 'Hello from Bun Server!',
    };
});

// Health check endpoint for monitoring
server.route('GET', API_ROUTES.HEALTH, async (): Promise<HttpResponse> => {
    const response: ApiResponse<{ status: string }> = {
        data: { status: 'ok' },
    };

    return {
        status: 200,
        headers: {},
        body: response,
    };
});

/**
 * Task CRUD Routes
 */

// GET /api/tasks - Get all tasks (optionally filtered by date)
server.route(
    'GET',
    API_ROUTES.TASKS,
    withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
        const date = getQueryParam(req.url, 'date');
        const tasks = date ? await taskRepo.findByDate(date) : await taskRepo.findAll();
        return successResponse(tasks);
    }),
);

// POST /api/tasks - Create a new task
server.route(
    'POST',
    API_ROUTES.TASKS,
    withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
        const input = await req.json<CreateTaskInput>();

        // Validate input
        if (!input.text || typeof input.text !== 'string') {
            throw validationError('Text is required');
        }

        if (input.text.length < TASK_CONSTRAINTS.MIN_TEXT_LENGTH) {
            throw validationError(
                `Text must be at least ${TASK_CONSTRAINTS.MIN_TEXT_LENGTH} character`,
            );
        }

        if (input.text.length > TASK_CONSTRAINTS.MAX_TEXT_LENGTH) {
            throw validationError(
                `Text must not exceed ${TASK_CONSTRAINTS.MAX_TEXT_LENGTH} characters`,
            );
        }

        if (!input.date || typeof input.date !== 'string') {
            throw validationError('Date is required (ISO 8601 format)');
        }

        // Create the task
        const task = await taskRepo.create(input);

        return successResponse(task, 201);
    }),
);

// GET /api/tasks/:id - Get a single task by ID
server.route(
    'GET',
    '/api/tasks/:id',
    withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
        const id = extractIdFromPath(req.url);
        if (!id) {
            throw new BadRequestError('Invalid task ID');
        }

        const task = await taskRepo.findById(id);
        if (!task) {
            throw notFoundError('Task', id);
        }

        return successResponse(task);
    }),
);

// PUT /api/tasks/:id - Update a task
server.route(
    'PUT',
    '/api/tasks/:id',
    withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
        const id = extractIdFromPath(req.url);
        if (!id) {
            throw new BadRequestError('Invalid task ID');
        }

        const input = await req.json<UpdateTaskInput>();

        // Validate input
        if (input.text !== undefined) {
            if (typeof input.text !== 'string') {
                throw validationError('Text must be a string');
            }

            if (input.text.length < TASK_CONSTRAINTS.MIN_TEXT_LENGTH) {
                throw validationError(
                    `Text must be at least ${TASK_CONSTRAINTS.MIN_TEXT_LENGTH} character`,
                );
            }

            if (input.text.length > TASK_CONSTRAINTS.MAX_TEXT_LENGTH) {
                throw validationError(
                    `Text must not exceed ${TASK_CONSTRAINTS.MAX_TEXT_LENGTH} characters`,
                );
            }
        }

        if (input.completed !== undefined && typeof input.completed !== 'boolean') {
            throw validationError('Completed must be a boolean');
        }

        if (input.date !== undefined && typeof input.date !== 'string') {
            throw validationError('Date must be a string (ISO 8601 format)');
        }

        // Update the task
        const task = await taskRepo.update(id, input);
        if (!task) {
            throw notFoundError('Task', id);
        }

        return successResponse(task);
    }),
);

// DELETE /api/tasks/:id - Delete a task
server.route(
    'DELETE',
    '/api/tasks/:id',
    withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
        const id = extractIdFromPath(req.url);
        if (!id) {
            throw new BadRequestError('Invalid task ID');
        }

        const deleted = await taskRepo.delete(id);
        if (!deleted) {
            throw notFoundError('Task', id);
        }

        return successResponse({ success: true });
    }),
);

/**
 * Start the server
 */
await server.start(PORT);
logger.info(`🚀 Server running at http://localhost:${server.getPort()}`);
