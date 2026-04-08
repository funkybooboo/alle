/**
 * Task API routes
 */

import type { Logger } from '@alle/shared';
import {
    API_ROUTES,
    BadRequestError,
    type CreateTaskInput,
    type Task,
    type UpdateTaskInput,
} from '@alle/shared';
import { z } from 'zod';
import type { TaskRepository } from '../adapters/data/TaskRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import { CreateTaskSchema, UpdateTaskSchema } from '../openapi/schemas/task';
import { negotiate } from '../utils/contentNegotiation';
import { notFoundError } from '../utils/errorHandler';
import { formatTasksAsText } from '../utils/formatters';
import { extractPathParam } from '../utils/pathUtils';
import { successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody, parseQuery } from '../utils/validate';

const TaskQuerySchema = z.object({
    date: z.string().optional(),
    tag: z.string().optional(),
    completed: z
        .enum(['true', 'false'])
        .transform(v => v === 'true')
        .optional(),
    someDayGroupId: z.string().optional(),
    someday: z.enum(['true']).optional(),
});

export function registerTaskRoutes(
    server: HttpServer,
    taskRepo: TaskRepository,
    logger: Logger,
): void {
    // GET /api/tasks
    server.route(
        'GET',
        API_ROUTES.TASKS,
        withErrorHandling(async req => {
            const query = parseQuery(TaskQuerySchema, req.url);

            let tasks: Task[];
            if (query.someday) {
                tasks = await taskRepo.findSomeday();
            } else if (query.someDayGroupId) {
                tasks = await taskRepo.findBySomeDayGroup(query.someDayGroupId);
            } else if (query.tag) {
                tasks = await taskRepo.findByTags([query.tag]);
            } else if (query.date) {
                tasks = await taskRepo.findByDate(query.date);
            } else {
                tasks = await taskRepo.findAll();
            }

            if (query.completed !== undefined) {
                tasks = tasks.filter(t => t.completed === query.completed);
            }

            if (negotiate(req.headers['accept']) === 'text') {
                return {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: formatTasksAsText(tasks),
                };
            }

            return successResponse(tasks);
        }, logger),
    );

    // POST /api/tasks
    server.route(
        'POST',
        API_ROUTES.TASKS,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const input = parseBody(CreateTaskSchema, raw) as unknown as CreateTaskInput;
            const task = await taskRepo.create(input);
            return successResponse(task, 201);
        }, logger),
    );

    // GET /api/tasks/:id
    server.route(
        'GET',
        '/api/tasks/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/tasks/:id');
            if (!id) throw new BadRequestError('Invalid task ID');
            const task = await taskRepo.findById(id);
            if (!task) throw notFoundError('Task', id);
            return successResponse(task);
        }, logger),
    );

    // PUT /api/tasks/:id
    server.route(
        'PUT',
        '/api/tasks/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/tasks/:id');
            if (!id) throw new BadRequestError('Invalid task ID');
            const raw = await req.json<unknown>();
            const input = parseBody(UpdateTaskSchema, raw) as unknown as UpdateTaskInput;
            const task = await taskRepo.update(id, input);
            if (!task) throw notFoundError('Task', id);

            // Sub-task rollup: when a task is completed and has a parent,
            // auto-complete the parent if all its children are now done.
            if (input.completed === true && task.parentId !== null) {
                const siblings = await taskRepo.findChildren(task.parentId);
                if (siblings.length > 0 && siblings.every(s => s.completed)) {
                    await taskRepo.update(task.parentId, { completed: true });
                }
            }

            return successResponse(task);
        }, logger),
    );

    // DELETE /api/tasks/:id
    server.route(
        'DELETE',
        '/api/tasks/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/tasks/:id');
            if (!id) throw new BadRequestError('Invalid task ID');
            const deleted = await taskRepo.delete(id);
            if (!deleted) throw notFoundError('Task', id);
            return successResponse({ success: true });
        }, logger),
    );
}
