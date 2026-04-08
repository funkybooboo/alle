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
    registerTaskRoutes(server, container.taskRepository, logger);
    registerSomeDayGroupRoutes(server, container.someDayGroupRepository, logger);
    registerProjectRoutes(server, container.projectRepository, logger);
    registerRecurringTaskRoutes(
        server,
        container.recurringTaskRepository,
        container.taskRepository,
        logger,
    );
    registerTagRoutes(server, container.taskRepository, logger);
    registerUserPreferencesRoutes(server, container.userPreferencesRepository, logger);
}
