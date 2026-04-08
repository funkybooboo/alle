/**
 * SomeDayGroup API routes
 */

import type { Logger } from '@alle/shared';
import {
    API_ROUTES,
    BadRequestError,
    type CreateSomeDayGroupInput,
    type UpdateSomeDayGroupInput,
} from '@alle/shared';
import type { SomeDayGroupRepository } from '../adapters/data/SomeDayGroupRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import {
    CreateSomeDayGroupSchema,
    UpdateSomeDayGroupSchema,
} from '../openapi/schemas/someDayGroup';
import { negotiate } from '../utils/contentNegotiation';
import { notFoundError } from '../utils/errorHandler';
import { formatGroupsAsText } from '../utils/formatters';
import { extractPathParam } from '../utils/pathUtils';
import { successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody } from '../utils/validate';

export function registerSomeDayGroupRoutes(
    server: HttpServer,
    someDayGroupRepo: SomeDayGroupRepository,
    logger: Logger,
): void {
    // GET /api/someday-groups
    server.route(
        'GET',
        API_ROUTES.SOMEDAY_GROUPS,
        withErrorHandling(async req => {
            const groups = await someDayGroupRepo.findAll();
            if (negotiate(req.headers['accept']) === 'text') {
                return {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: formatGroupsAsText(groups),
                };
            }
            return successResponse(groups);
        }, logger),
    );

    // POST /api/someday-groups
    server.route(
        'POST',
        API_ROUTES.SOMEDAY_GROUPS,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const input = parseBody(
                CreateSomeDayGroupSchema,
                raw,
            ) as unknown as CreateSomeDayGroupInput;
            const group = await someDayGroupRepo.create(input);
            return successResponse(group, 201);
        }, logger),
    );

    // GET /api/someday-groups/:id
    server.route(
        'GET',
        '/api/someday-groups/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/someday-groups/:id');
            if (!id) throw new BadRequestError('Invalid group ID');
            const group = await someDayGroupRepo.findById(id);
            if (!group) throw notFoundError('SomeDayGroup', id);
            return successResponse(group);
        }, logger),
    );

    // PUT /api/someday-groups/:id
    server.route(
        'PUT',
        '/api/someday-groups/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/someday-groups/:id');
            if (!id) throw new BadRequestError('Invalid group ID');
            const raw = await req.json<unknown>();
            const input = parseBody(
                UpdateSomeDayGroupSchema,
                raw,
            ) as unknown as UpdateSomeDayGroupInput;
            const group = await someDayGroupRepo.update(id, input);
            if (!group) throw notFoundError('SomeDayGroup', id);
            return successResponse(group);
        }, logger),
    );

    // DELETE /api/someday-groups/:id
    server.route(
        'DELETE',
        '/api/someday-groups/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/someday-groups/:id');
            if (!id) throw new BadRequestError('Invalid group ID');
            const deleted = await someDayGroupRepo.delete(id);
            if (!deleted) throw notFoundError('SomeDayGroup', id);
            return successResponse({ success: true });
        }, logger),
    );
}
