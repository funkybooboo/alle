/**
 * RecurringTask API routes
 */

import type { Logger } from '@alle/shared';
import {
    API_ROUTES,
    BadRequestError,
    type CreateRecurringTaskInput,
    type CreateTaskInput,
    type UpdateRecurringTaskInput,
} from '@alle/shared';
import type { RecurringTaskRepository } from '../adapters/data/RecurringTaskRepository';
import type { TaskRepository } from '../adapters/data/TaskRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import {
    CreateRecurringTaskSchema,
    GenerateInstancesSchema,
    UpdateRecurringTaskSchema,
} from '../openapi/schemas/recurringTask';
import { negotiate } from '../utils/contentNegotiation';
import { notFoundError } from '../utils/errorHandler';
import { formatRecurringTasksAsText } from '../utils/formatters';
import { extractPathParam } from '../utils/pathUtils';
import { generateOccurrences } from '../utils/recurringTaskUtils';
import { successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody } from '../utils/validate';

export function registerRecurringTaskRoutes(
    server: HttpServer,
    recurringTaskRepo: RecurringTaskRepository,
    taskRepo: TaskRepository,
    logger: Logger,
): void {
    // GET /api/recurring-tasks
    server.route(
        'GET',
        API_ROUTES.RECURRING_TASKS,
        withErrorHandling(async req => {
            const tasks = await recurringTaskRepo.findAll();
            if (negotiate(req.headers['accept']) === 'text') {
                return {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: formatRecurringTasksAsText(tasks),
                };
            }
            return successResponse(tasks);
        }, logger),
    );

    // POST /api/recurring-tasks
    server.route(
        'POST',
        API_ROUTES.RECURRING_TASKS,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const input = parseBody(
                CreateRecurringTaskSchema,
                raw,
            ) as unknown as CreateRecurringTaskInput;
            const task = await recurringTaskRepo.create(input);
            return successResponse(task, 201);
        }, logger),
    );

    // GET /api/recurring-tasks/:id
    server.route(
        'GET',
        '/api/recurring-tasks/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/recurring-tasks/:id');
            if (!id) throw new BadRequestError('Invalid recurring task ID');
            const task = await recurringTaskRepo.findById(id);
            if (!task) throw notFoundError('RecurringTask', id);
            return successResponse(task);
        }, logger),
    );

    // PUT /api/recurring-tasks/:id
    server.route(
        'PUT',
        '/api/recurring-tasks/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/recurring-tasks/:id');
            if (!id) throw new BadRequestError('Invalid recurring task ID');
            const raw = await req.json<unknown>();
            const input = parseBody(
                UpdateRecurringTaskSchema,
                raw,
            ) as unknown as UpdateRecurringTaskInput;
            const task = await recurringTaskRepo.update(id, input);
            if (!task) throw notFoundError('RecurringTask', id);
            return successResponse(task);
        }, logger),
    );

    // POST /api/recurring-tasks/:id/generate
    server.route(
        'POST',
        '/api/recurring-tasks/:id/generate',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/recurring-tasks/:id/generate');
            if (!id) throw new BadRequestError('Invalid recurring task ID');
            const rt = await recurringTaskRepo.findById(id);
            if (!rt) throw notFoundError('RecurringTask', id);

            const raw = await req.json<unknown>();
            const { startDate, endDate } = parseBody(GenerateInstancesSchema, raw);

            const dates = generateOccurrences(rt, startDate, endDate);
            const created = await Promise.all(
                dates.map(date => {
                    const taskInput: CreateTaskInput = {
                        text: rt.text,
                        date,
                        notes: rt.notes,
                        tags: rt.tags,
                        projectId: rt.projectId,
                        rolloverEnabled: rt.rolloverEnabled,
                    };
                    return taskRepo.create(taskInput);
                }),
            );

            return successResponse(created);
        }, logger),
    );

    // DELETE /api/recurring-tasks/:id
    server.route(
        'DELETE',
        '/api/recurring-tasks/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/recurring-tasks/:id');
            if (!id) throw new BadRequestError('Invalid recurring task ID');
            const deleted = await recurringTaskRepo.delete(id);
            if (!deleted) throw notFoundError('RecurringTask', id);
            return successResponse({ success: true });
        }, logger),
    );
}
