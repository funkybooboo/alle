/**
 * Project API routes
 */

import type { Logger } from '@alle/shared';
import {
    API_ROUTES,
    BadRequestError,
    type CreateProjectInput,
    type UpdateProjectInput,
} from '@alle/shared';
import { z } from 'zod';
import type { ProjectRepository } from '../adapters/data/ProjectRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import { CreateProjectSchema, UpdateProjectSchema } from '../openapi/schemas/project';
import { negotiate } from '../utils/contentNegotiation';
import { notFoundError } from '../utils/errorHandler';
import { formatProjectsAsText } from '../utils/formatters';
import { extractPathParam } from '../utils/pathUtils';
import { successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody, parseQuery } from '../utils/validate';

const ProjectQuerySchema = z.object({
    active: z.enum(['true', 'false']).optional(),
});

export function registerProjectRoutes(
    server: HttpServer,
    projectRepo: ProjectRepository,
    logger: Logger,
): void {
    // GET /api/projects
    server.route(
        'GET',
        API_ROUTES.PROJECTS,
        withErrorHandling(async req => {
            const query = parseQuery(ProjectQuerySchema, req.url);
            const projects =
                query.active === 'true'
                    ? await projectRepo.findActive()
                    : await projectRepo.findAll();

            if (negotiate(req.headers['accept']) === 'text') {
                return {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    body: formatProjectsAsText(projects),
                };
            }
            return successResponse(projects);
        }, logger),
    );

    // POST /api/projects
    server.route(
        'POST',
        API_ROUTES.PROJECTS,
        withErrorHandling(async req => {
            const raw = await req.json<unknown>();
            const input = parseBody(CreateProjectSchema, raw) as unknown as CreateProjectInput;
            const project = await projectRepo.create(input);
            return successResponse(project, 201);
        }, logger),
    );

    // GET /api/projects/:id
    server.route(
        'GET',
        '/api/projects/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/projects/:id');
            if (!id) throw new BadRequestError('Invalid project ID');
            const project = await projectRepo.findById(id);
            if (!project) throw notFoundError('Project', id);
            return successResponse(project);
        }, logger),
    );

    // PUT /api/projects/:id
    server.route(
        'PUT',
        '/api/projects/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/projects/:id');
            if (!id) throw new BadRequestError('Invalid project ID');
            const raw = await req.json<unknown>();
            const input = parseBody(UpdateProjectSchema, raw) as unknown as UpdateProjectInput;
            const project = await projectRepo.update(id, input);
            if (!project) throw notFoundError('Project', id);
            return successResponse(project);
        }, logger),
    );

    // POST /api/projects/:id/activate
    server.route(
        'POST',
        '/api/projects/:id/activate',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/projects/:id/activate');
            if (!id) throw new BadRequestError('Invalid project ID');
            const project = await projectRepo.update(id, { isActive: true });
            if (!project) throw notFoundError('Project', id);
            return successResponse(project);
        }, logger),
    );

    // POST /api/projects/:id/deactivate
    server.route(
        'POST',
        '/api/projects/:id/deactivate',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/projects/:id/deactivate');
            if (!id) throw new BadRequestError('Invalid project ID');
            const project = await projectRepo.update(id, { isActive: false });
            if (!project) throw notFoundError('Project', id);
            return successResponse(project);
        }, logger),
    );

    // DELETE /api/projects/:id
    server.route(
        'DELETE',
        '/api/projects/:id',
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, '/api/projects/:id');
            if (!id) throw new BadRequestError('Invalid project ID');
            const deleted = await projectRepo.delete(id);
            if (!deleted) throw notFoundError('Project', id);
            return successResponse({ success: true });
        }, logger),
    );
}
