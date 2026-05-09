/**
 * Bun-specific HTTP server implementation
 *
 * Wraps Bun.serve() to provide a clean, framework-agnostic interface.
 * Supports WebSocket upgrades via ConnectionManager injection.
 */

import { pathToRegex } from '../../utils/pathUtils';
import type { ConnectionManager } from '../ws/ConnectionManager';
import type { HttpServer, HttpServerConfig } from './HttpServer';
import type { Guard, HttpRequest, HttpResponse, Middleware, RouteHandler } from './types';

interface RouteEntry {
    method: string;
    regex: RegExp;
    handler: RouteHandler;
}

let clientCounter = 0;

function generateClientId(): string {
    clientCounter++;
    return `ws_${Date.now()}_${clientCounter}`;
}

export class BunHttpServer implements HttpServer {
    private server: ReturnType<typeof Bun.serve> | null = null;
    private routes: RouteEntry[] = [];
    private guards: Guard[] = [];
    private middlewares: Middleware[] = [];
    private config: HttpServerConfig;
    private connectionManager: ConnectionManager | null = null;

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

    setConnectionManager(cm: ConnectionManager): void {
        this.connectionManager = cm;
    }

    route(method: string, path: string, handler: RouteHandler): void {
        this.routes.push({ method, regex: pathToRegex(path), handler });
    }

    addGuard(guard: Guard): void {
        this.guards.push(guard);
    }

    use(middleware: Middleware): void {
        this.middlewares.push(middleware);
    }

    async start(port: number): Promise<void> {
        const cm = this.connectionManager;

        if (cm) {
            this.server = Bun.serve({
                port,
                fetch: async (req: Request, server: Bun.Server<Record<string, unknown>>) => {
                    if (req.headers.get('upgrade') === 'websocket') {
                        const clientId = generateClientId();
                        server.upgrade(req, { data: { clientId } });
                        return;
                    }
                    return this.handleHttpRequest(req);
                },
                websocket: {
                    open(ws: Bun.ServerWebSocket<{ clientId: string }>) {
                        cm.add(ws.data.clientId, ws as unknown as WebSocket);
                    },
                    message(
                        ws: Bun.ServerWebSocket<{ clientId: string }>,
                        message: string | Buffer,
                    ) {
                        cm.handleMessage(ws.data.clientId, message);
                    },
                    close(ws: Bun.ServerWebSocket<{ clientId: string }>) {
                        cm.remove(ws.data.clientId);
                    },
                },
            });
        } else {
            this.server = Bun.serve({
                port,
                fetch: async (req: Request) => {
                    return this.handleHttpRequest(req);
                },
            });
        }
    }

    private async handleHttpRequest(req: Request): Promise<Response> {
        const url = new URL(req.url);

        if (req.method === 'OPTIONS') {
            const responseInit: ResponseInit = this.config.corsHeaders
                ? { headers: this.config.corsHeaders }
                : {};
            return new Response(null, responseInit);
        }

        const entry = this.routes.find(r => r.method === req.method && r.regex.test(url.pathname));

        if (!entry) {
            const responseInit: ResponseInit =
                this.config.corsHeaders !== undefined
                    ? { status: 404, headers: this.config.corsHeaders }
                    : { status: 404 };
            return new Response('Not Found', responseInit);
        }

        const httpReq: HttpRequest = {
            method: req.method,
            url: req.url,
            headers: Object.fromEntries(req.headers.entries()),
            json: <T>() => req.json() as Promise<T>,
            text: () => req.text(),
        };

        for (const guard of this.guards) {
            const guardResponse = guard(httpReq);
            if (guardResponse !== null) {
                return this.toNativeResponse(guardResponse);
            }
        }

        let response = await entry.handler(httpReq);

        for (const middleware of this.middlewares) {
            response = middleware(httpReq, response);
        }

        return this.toNativeResponse(response);
    }

    async stop(): Promise<void> {
        if (this.server) {
            this.server.stop();
            this.server = null;
        }
    }

    getPort(): number | null {
        return this.server?.port ?? null;
    }

    private toNativeResponse(response: HttpResponse): Response {
        const headers = { ...this.config.corsHeaders, ...response.headers };

        if (typeof response.body === 'object') {
            return Response.json(response.body, {
                status: response.status,
                headers,
            });
        }

        return new Response(response.body, {
            status: response.status,
            headers,
        });
    }
}
