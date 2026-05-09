/**
 * Task API routes
 */

import type { Logger } from '@alle/shared';
import {
    API_ROUTES,
    BadRequestError,
    type CreateTaskInput,
    type UpdateTaskInput,
} from '@alle/shared';
import type { TaskRepository } from '../adapters/data/TaskRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import { CreateTaskSchema, TaskQuerySchema, UpdateTaskSchema } from '../openapi/schemas/task';
import { formatTasksAsText } from '../presentation/formatters';
import type { EventBus } from '../services/EventBus';
import type { TaskService } from '../services/TaskService';
import { notFoundError } from '../utils/errorHandler';
import { extractPathParam } from '../utils/pathUtils';
import { respondNegotiated, successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody, parseQuery } from '../utils/validate';

export function registerTaskRoutes(
    server: HttpServer,
    taskRepo: TaskRepository,
    taskService: TaskService,
    eventBus: EventBus,
    logger: Logger,
): void {
    // GET /api/tasks
    server.route(
        'GET',
        API_ROUTES.TASKS,
        withErrorHandling(async req => {
            const query = parseQuery(TaskQuerySchema, req.url);
            const tasks = await taskService.listTasks(query);
            return respondNegotiated(req, tasks, formatTasksAsText);
        }, logger),
    );

    // POST /api/tasks
    server.route(
        'POST',
        API_ROUTES.TASKS,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const originClientId = req.headers['x-client-id'];
            const input = parseBody(CreateTaskSchema, raw) as unknown as CreateTaskInput;
            const task = await taskRepo.create(input);
            eventBus.publish('task:created', { task }, originClientId);
            return successResponse(task, 201);
        }, logger),
    );

    // GET /api/tasks/:id
    server.route(
        'GET',
        API_ROUTES.TASK_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.TASK_ROUTE_PATTERN);
            if (!id) throw new BadRequestError('Invalid task ID');
            const task = await taskRepo.findById(id);
            if (!task) throw notFoundError('Task', id);
            return successResponse(task);
        }, logger),
    );

    // PUT /api/tasks/:id
    server.route(
        'PUT',
        API_ROUTES.TASK_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.TASK_ROUTE_PATTERN);
            if (!id) throw new BadRequestError('Invalid task ID');
            const originClientId = req.headers['x-client-id'];
            const raw = await req.json<unknown>();
            const input = parseBody(UpdateTaskSchema, raw) as unknown as UpdateTaskInput;
            const task = await taskService.completeTask(id, input);
            if (!task) throw notFoundError('Task', id);
            eventBus.publish('task:updated', { task }, originClientId);
            return successResponse(task);
        }, logger),
    );

    // DELETE /api/tasks/:id (soft-delete)
    server.route(
        'DELETE',
        API_ROUTES.TASK_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.TASK_ROUTE_PATTERN);
            if (!id) throw new BadRequestError('Invalid task ID');
            const originClientId = req.headers['x-client-id'];
            const deleted = await taskRepo.delete(id);
            if (!deleted) throw notFoundError('Task', id);
            eventBus.publish('task:deleted', { id }, originClientId);
            return successResponse({ success: true });
        }, logger),
    );

    // POST /api/tasks/:id/restore
    server.route(
        'POST',
        API_ROUTES.TASK_RESTORE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.TASK_RESTORE_PATTERN);
            if (!id) throw new BadRequestError('Invalid task ID');
            const originClientId = req.headers['x-client-id'];
            const task = await taskRepo.restore(id);
            if (!task) throw notFoundError('Task', id);
            eventBus.publish('task:restored', { task }, originClientId);
            return successResponse(task);
        }, logger),
    );

    // DELETE /api/tasks/purge
    server.route(
        'DELETE',
        API_ROUTES.TASK_PURGE,
        withErrorHandling(async _req => {
            const purged = await taskService.purge();
            return successResponse({ purged });
        }, logger),
    );

    // GET /api/tasks/trash
    server.route(
        'GET',
        API_ROUTES.TASK_TRASH,
        withErrorHandling(async _req => {
            const tasks = await taskService.getTrash();
            return successResponse(tasks);
        }, logger),
    );
}
