/**
 * Bun-specific HTTP server implementation
 *
 * Wraps Bun.serve() to provide a clean, framework-agnostic interface.
 * Benefits:
 * - Route-based architecture (no giant fetch handler)
 * - Easy to swap to Node.js/Express by changing one line in container
 * - Built-in CORS handling
 * - Type-safe request/response handling
 */

import type { HttpServer, HttpServerConfig } from './HttpServer';
import type { HttpRequest, HttpResponse, RouteHandler } from './types';

/**
 * HTTP server implementation using Bun.serve()
 */
export class BunHttpServer implements HttpServer {
    private server: ReturnType<typeof Bun.serve> | null = null;
    private routes: Map<string, RouteHandler> = new Map();
    private config: HttpServerConfig;

    /**
     * Create a new Bun HTTP server
     * @param config - Server configuration (CORS settings, etc.)
     */
    constructor(config: HttpServerConfig = {}) {
        this.config = {
            corsOrigin: config.corsOrigin || '*',
            corsHeaders: config.corsHeaders || {
                'Access-Control-Allow-Origin': config.corsOrigin || '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    }

    /**
     * Register a route handler
     * Routes are stored in a Map with key format: "METHOD:path"
     */
    route(method: string, path: string, handler: RouteHandler): void {
        const key = `${method}:${path}`;
        this.routes.set(key, handler);
    }

    /**
     * Start the server
     * Creates a Bun.serve() instance that routes requests to registered handlers
     */
    async start(port: number): Promise<void> {
        this.server = Bun.serve({
            port,
            fetch: async (req: Request) => {
                const url = new URL(req.url);
                const key = `${req.method}:${url.pathname}`;

                // Handle CORS preflight requests
                if (req.method === 'OPTIONS') {
                    // Only include headers in Response if they exist (exactOptionalPropertyTypes compliance)
                    const responseInit: ResponseInit = this.config.corsHeaders
                        ? { headers: this.config.corsHeaders }
                        : {};
                    return new Response(null, responseInit);
                }

                // Find matching route (exact match first, then pattern match)
                let handler = this.routes.get(key);

                // If no exact match, try pattern matching for routes with path parameters
                if (!handler) {
                    for (const [routeKey, routeHandler] of this.routes.entries()) {
                        // Check if this is a parameterized route (METHOD:path format where path contains :param)
                        const colonIndex = routeKey.indexOf(':');
                        if (colonIndex > 0) {
                            const routeMethod = routeKey.substring(0, colonIndex);
                            const routePath = routeKey.substring(colonIndex + 1);

                            // Only check routes with matching method
                            if (routeMethod !== req.method) continue;

                            // Check if route path contains parameter syntax (e.g., :id)
                            if (routePath.includes(':')) {
                                // Convert route pattern to regex
                                // e.g., "/api/tasks/:id" -> /^\/api\/tasks\/([^/]+)$/
                                const pattern = routePath.replace(/:[^/]+/g, '([^/]+)');
                                const regex = new RegExp(`^${pattern}$`);

                                if (regex.test(url.pathname)) {
                                    handler = routeHandler;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (!handler) {
                    // Build response init, only including headers if they exist (exactOptionalPropertyTypes compliance)
                    const responseInit: ResponseInit =
                        this.config.corsHeaders !== undefined
                            ? { status: 404, headers: this.config.corsHeaders }
                            : { status: 404 };
                    return new Response('Not Found', responseInit);
                }

                // Wrap Request in our abstraction
                const httpReq: HttpRequest = {
                    method: req.method,
                    url: req.url,
                    headers: Object.fromEntries(req.headers.entries()),
                    json: <T>() => req.json() as Promise<T>,
                    text: () => req.text(),
                };

                // Execute handler
                const response = await handler(httpReq);

                // Convert our response to Bun Response
                return this.toNativeResponse(response);
            },
        });
    }

    /**
     * Stop the server
     */
    async stop(): Promise<void> {
        if (this.server) {
            this.server.stop();
            this.server = null;
        }
    }

    /**
     * Get the current server port
     */
    getPort(): number | null {
        return this.server?.port ?? null;
    }

    /**
     * Convert our HttpResponse to native Bun Response
     * Handles JSON responses and adds CORS headers
     */
    private toNativeResponse(response: HttpResponse): Response {
        const headers = { ...this.config.corsHeaders, ...response.headers };

        // If body is an object, send as JSON
        if (typeof response.body === 'object' && response.body !== null) {
            return Response.json(response.body, {
                status: response.status,
                headers,
            });
        }

        // Otherwise send as text
        return new Response(response.body, {
            status: response.status,
            headers,
        });
    }
}
