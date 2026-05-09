/**
 * Route registration orchestrator
 *
 * Imports all route modules and registers them against the HTTP server.
 * Add new route modules here as they are created.
 */

import type { Logger } from '@alle/shared';
import type { HttpServer } from '../adapters/http/HttpServer';
import type { Container } from '../container';
import { registerOpenApiRoutes } from './openApiRoutes';
import { registerProjectRoutes } from './projectRoutes';
import { registerRecurringTaskRoutes } from './recurringTaskRoutes';
import { registerSomeDayGroupRoutes } from './someDayGroupRoutes';
import { registerTagRoutes } from './tagRoutes';
import { registerTaskRoutes } from './taskRoutes';
import { registerUserPreferencesRoutes } from './userPreferencesRoutes';

export function registerAllRoutes(server: HttpServer, container: Container): void {
    const logger: Logger = container.logger;

    registerOpenApiRoutes(server);
    registerTaskRoutes(
        server,
        container.taskRepository,
        container.taskService,
        container.eventBus,
        logger,
    );
    registerSomeDayGroupRoutes(
        server,
        container.someDayGroupRepository,
        container.eventBus,
        logger,
    );
    registerProjectRoutes(
        server,
        container.projectRepository,
        container.projectService,
        container.eventBus,
        logger,
    );
    registerRecurringTaskRoutes(
        server,
        container.recurringTaskRepository,
        container.recurringTaskService,
        container.eventBus,
        logger,
    );
    registerTagRoutes(server, container.tagService, container.eventBus, logger);
    registerUserPreferencesRoutes(server, container.userPreferencesRepository, logger);
}
