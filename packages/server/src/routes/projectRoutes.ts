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
import type { ProjectRepository } from '../adapters/data/ProjectRepository';
import type { HttpServer } from '../adapters/http/HttpServer';
import {
    CreateProjectSchema,
    ProjectQuerySchema,
    UpdateProjectSchema,
} from '../openapi/schemas/project';
import { formatProjectsAsText } from '../presentation/formatters';
import type { EventBus } from '../services/EventBus';
import type { ProjectService } from '../services/ProjectService';
import { notFoundError } from '../utils/errorHandler';
import { extractPathParam } from '../utils/pathUtils';
import { respondNegotiated, successResponse, withErrorHandling } from '../utils/routeHelpers';
import { parseBody, parseQuery } from '../utils/validate';

export function registerProjectRoutes(
    server: HttpServer,
    projectRepo: ProjectRepository,
    projectService: ProjectService,
    eventBus: EventBus,
    logger: Logger,
): void {
    // GET /api/projects
    server.route(
        'GET',
        API_ROUTES.PROJECTS,
        withErrorHandling(async req => {
            const query = parseQuery(ProjectQuerySchema, req.url);
            const projects = await projectService.listProjects(query.active === 'true');
            return respondNegotiated(req, projects, formatProjectsAsText);
        }, logger),
    );

    // POST /api/projects
    server.route(
        'POST',
        API_ROUTES.PROJECTS,
        withErrorHandling(async req => {
            const originClientId = req.headers['x-client-id'];
            const raw = await req.json<unknown>();
            const input = parseBody(CreateProjectSchema, raw) as unknown as CreateProjectInput;
            const project = await projectRepo.create(input);
            eventBus.publish('project:created', { project }, originClientId);
            return successResponse(project, 201);
        }, logger),
    );

    // GET /api/projects/:id
    server.route(
        'GET',
        API_ROUTES.PROJECT_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.PROJECT_ROUTE_PATTERN);
            if (!id) throw new BadRequestError('Invalid project ID');
            const project = await projectRepo.findById(id);
            if (!project) throw notFoundError('Project', id);
            return successResponse(project);
        }, logger),
    );

    // PUT /api/projects/:id
    server.route(
        'PUT',
        API_ROUTES.PROJECT_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.PROJECT_ROUTE_PATTERN);
            if (!id) throw new BadRequestError('Invalid project ID');
            const originClientId = req.headers['x-client-id'];
            const raw = await req.json<unknown>();
            const input = parseBody(UpdateProjectSchema, raw) as unknown as UpdateProjectInput;
            const project = await projectRepo.update(id, input);
            if (!project) throw notFoundError('Project', id);
            eventBus.publish('project:updated', { project }, originClientId);
            return successResponse(project);
        }, logger),
    );

    // POST /api/projects/:id/activate
    server.route(
        'POST',
        API_ROUTES.PROJECT_ACTIVATE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.PROJECT_ACTIVATE_PATTERN);
            if (!id) throw new BadRequestError('Invalid project ID');
            const originClientId = req.headers['x-client-id'];
            const project = await projectRepo.update(id, { isActive: true });
            if (!project) throw notFoundError('Project', id);
            eventBus.publish('project:updated', { project }, originClientId);
            return successResponse(project);
        }, logger),
    );

    // POST /api/projects/:id/deactivate
    server.route(
        'POST',
        API_ROUTES.PROJECT_DEACTIVATE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.PROJECT_DEACTIVATE_PATTERN);
            if (!id) throw new BadRequestError('Invalid project ID');
            const originClientId = req.headers['x-client-id'];
            const project = await projectRepo.update(id, { isActive: false });
            if (!project) throw notFoundError('Project', id);
            eventBus.publish('project:updated', { project }, originClientId);
            return successResponse(project);
        }, logger),
    );

    // DELETE /api/projects/:id
    server.route(
        'DELETE',
        API_ROUTES.PROJECT_ROUTE_PATTERN,
        withErrorHandling(async req => {
            const id = extractPathParam(req.url, API_ROUTES.PROJECT_ROUTE_PATTERN);
            if (!id) throw new BadRequestError('Invalid project ID');
            const originClientId = req.headers['x-client-id'];
            const deleted = await projectRepo.delete(id);
            if (!deleted) throw notFoundError('Project', id);
            eventBus.publish('project:deleted', { id }, originClientId);
            return successResponse({ success: true });
        }, logger),
    );
}
