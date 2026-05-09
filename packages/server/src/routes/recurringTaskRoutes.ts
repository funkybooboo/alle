/**
 * RecurringTask API routes
 */

import type { Logger } from '@alle/shared';
import {
    API_ROUTES,
    BadRequestError,
    type CreateRecurringTaskInput,
    type UpdateRecurringTaskInput,
} from '@alle/shared';
import type { RecurringTaskRepository } from '../adapters/data/RecurringTaskRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import {
    CreateRecurringTaskSchema,
    GenerateInstancesSchema,
    UpdateRecurringTaskSchema,
} from '../openapi/schemas/recurringTask';
import { formatRecurringTasksAsText } from '../presentation/formatters';
import type { RecurringTaskService } from '../services/RecurringTaskService';
import { notFoundError } from '../utils/errorHandler';
import { extractPathParam } from '../utils/pathUtils';
import { respondNegotiated, successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody } from '../utils/validate';

export function registerRecurringTaskRoutes(
    server: HttpServer,
    recurringTaskRepo: RecurringTaskRepository,
    recurringTaskService: RecurringTaskService,
    logger: Logger,
): void {
    // GET /api/recurring-tasks
    server.route(
        'GET',
        API_ROUTES.RECURRING_TASKS,
        withErrorHandling(async req => {
            const tasks = await recurringTaskRepo.findAll();
            return respondNegotiated(req, tasks, formatRecurringTasksAsText);
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
        API_ROUTES.RECURRING_TASK_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.RECURRING_TASK_ROUTE_PATTERN);
            if (!id) throw new BadRequestError('Invalid recurring task ID');
            const task = await recurringTaskRepo.findById(id);
            if (!task) throw notFoundError('RecurringTask', id);
            return successResponse(task);
        }, logger),
    );

    // PUT /api/recurring-tasks/:id
    server.route(
        'PUT',
        API_ROUTES.RECURRING_TASK_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.RECURRING_TASK_ROUTE_PATTERN);
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
        API_ROUTES.RECURRING_TASK_GENERATE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.RECURRING_TASK_GENERATE_PATTERN);
            if (!id) throw new BadRequestError('Invalid recurring task ID');

            const raw = await req.json<unknown>();
            const { startDate, endDate } = parseBody(GenerateInstancesSchema, raw);

            const created = await recurringTaskService.generateInstances(id, startDate, endDate);
            return successResponse(created);
        }, logger),
    );

    // DELETE /api/recurring-tasks/:id
    server.route(
        'DELETE',
        API_ROUTES.RECURRING_TASK_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.RECURRING_TASK_ROUTE_PATTERN);
            if (!id) throw new BadRequestError('Invalid recurring task ID');
            const deleted = await recurringTaskRepo.delete(id);
            if (!deleted) throw notFoundError('RecurringTask', id);
            return successResponse({ success: true });
        }, logger),
    );
}
