/**
 * Alle Task App - API Server
 *
 * Thin orchestrator: registers middleware, routes, then starts the server.
 * Swap the underlying runtime (Bun → Node/Express/Fastify) by changing
 * one line in container.ts — business logic stays unchanged.
 */

import type { ApiResponse } from '@alle/shared';
import type { HttpResponse } from './adapters/http/types';
import { container } from './container';
import { createRateLimiterGuard } from './middleware/rateLimiter';
import { createSecurityHeadersMiddleware } from './middleware/securityHeaders';
import { registerAllRoutes } from './routes/index';

const PORT = container.config.getNumber('PORT', 4000);
const NODE_ENV = container.config.get('NODE_ENV', 'development');
const RATE_LIMIT_RPM = container.config.getNumber('RATE_LIMIT_RPM', 60);

const server = container.httpServer;
const logger = container.logger;

// Guards run BEFORE the route handler (can short-circuit)
server.addGuard(createRateLimiterGuard(RATE_LIMIT_RPM));

// Middleware runs AFTER the route handler (mutates the response)
server.use(createSecurityHeadersMiddleware(NODE_ENV));

// Root endpoint
server.route('GET', '/', async (): Promise<HttpResponse> => {
    return { status: 200, headers: {}, body: 'Hello from Bun Server!' };
});

// Health check
server.route('GET', '/api/health', async (): Promise<HttpResponse> => {
    const response: ApiResponse<{ status: string }> = { data: { status: 'ok' } };
    return { status: 200, headers: {}, body: response };
});

// Register all resource routes
registerAllRoutes(server, container);

await server.start(PORT);
const port = server.getPort();
if (port === null) throw new Error('Server failed to start — port is null');
logger.info(`🚀 Server running at http://localhost:${port}`);
