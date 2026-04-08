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

import { pathToRegex } from '../../utils/pathUtils';
import type { HttpServer, HttpServerConfig } from './HttpServer';
import type { Guard, HttpRequest, HttpResponse, Middleware, RouteHandler } from './types';

interface RouteEntry {
    method: string;
    regex: RegExp;
    handler: RouteHandler;
}

/**
 * HTTP server implementation using Bun.serve()
 */
export class BunHttpServer implements HttpServer {
    private server: ReturnType<typeof Bun.serve> | null = null;
    private routes: RouteEntry[] = [];
    private guards: Guard[] = [];
    private middlewares: Middleware[] = [];
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
     * Register a route handler. The path pattern is compiled to a RegExp at
     * registration time so matching is O(n) but with no per-request regex compilation.
     */
    route(method: string, path: string, handler: RouteHandler): void {
        this.routes.push({ method, regex: pathToRegex(path), handler });
    }

    /**
     * Register a guard that runs before the route handler.
     * If the guard returns a response, the request is short-circuited.
     */
    addGuard(guard: Guard): void {
        this.guards.push(guard);
    }

    /**
     * Register a middleware function that runs after the route handler.
     * Middlewares run in registration order.
     */
    use(middleware: Middleware): void {
        this.middlewares.push(middleware);
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

                // Handle CORS preflight requests
                if (req.method === 'OPTIONS') {
                    // Only include headers in Response if they exist (exactOptionalPropertyTypes compliance)
                    const responseInit: ResponseInit = this.config.corsHeaders
                        ? { headers: this.config.corsHeaders }
                        : {};
                    return new Response(null, responseInit);
                }

                // Find matching route — first registration wins
                const entry = this.routes.find(
                    r => r.method === req.method && r.regex.test(url.pathname),
                );

                if (!entry) {
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

                // Run guards (before handler) — first match short-circuits
                for (const guard of this.guards) {
                    const guardResponse = guard(httpReq);
                    if (guardResponse !== null) {
                        return this.toNativeResponse(guardResponse);
                    }
                }

                // Execute handler
                let response = await entry.handler(httpReq);

                // Apply middlewares in registration order
                for (const middleware of this.middlewares) {
                    response = middleware(httpReq, response);
                }

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

        // If body is an object or array, send as JSON
        if (typeof response.body === 'object') {
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
