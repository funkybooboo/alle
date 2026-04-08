import { describe, expect, it } from 'bun:test';
import { BunHttpServer } from './BunHttpServer';
import type { Guard, HttpResponse, Middleware } from './types';

async function startServer(): Promise<BunHttpServer> {
    const server = new BunHttpServer();
    await server.start(0); // port 0 = OS assigns a free port
    return server;
}

async function fetch(server: BunHttpServer, method: string, path: string): Promise<Response> {
    const port = server.getPort();
    if (port === null) throw new Error('Server not started');
    return globalThis.fetch(`http://localhost:${port}${path}`, { method });
}

describe('BunHttpServer', () => {
    describe('route matching', () => {
        it('matches an exact route', async () => {
            const server = await startServer();
            server.route('GET', '/api/health', async () => ({
                status: 200,
                headers: {},
                body: 'ok',
            }));
            const res = await fetch(server, 'GET', '/api/health');
            expect(res.status).toBe(200);
            await server.stop();
        });

        it('matches a parameterized route', async () => {
            const server = await startServer();
            server.route('GET', '/api/tasks/:id', async () => ({
                status: 200,
                headers: {},
                body: { data: 'found' },
            }));
            const res = await fetch(server, 'GET', '/api/tasks/abc123');
            expect(res.status).toBe(200);
            await server.stop();
        });

        it('returns 404 for unregistered routes', async () => {
            const server = await startServer();
            const res = await fetch(server, 'GET', '/not-found');
            expect(res.status).toBe(404);
            await server.stop();
        });

        it('returns 404 when method does not match', async () => {
            const server = await startServer();
            server.route('POST', '/api/tasks', async () => ({
                status: 201,
                headers: {},
                body: { data: 'created' },
            }));
            const res = await fetch(server, 'GET', '/api/tasks');
            expect(res.status).toBe(404);
            await server.stop();
        });

        it('handles CORS preflight (OPTIONS) without hitting a route', async () => {
            const server = await startServer();
            let handlerCalled = false;
            server.route('GET', '/api/tasks', async () => {
                handlerCalled = true;
                return { status: 200, headers: {}, body: {} };
            });
            const res = await fetch(server, 'OPTIONS', '/api/tasks');
            expect(res.status).toBe(200);
            expect(handlerCalled).toBe(false);
            await server.stop();
        });
    });

    describe('guards', () => {
        it('guard returning null lets the request through', async () => {
            const server = await startServer();
            const passthrough: Guard = () => null;
            server.addGuard(passthrough);
            server.route('GET', '/api/tasks', async () => ({
                status: 200,
                headers: {},
                body: { data: [] },
            }));
            const res = await fetch(server, 'GET', '/api/tasks');
            expect(res.status).toBe(200);
            await server.stop();
        });

        it('guard returning a response short-circuits before the handler', async () => {
            const server = await startServer();
            let handlerCalled = false;

            const blocker: Guard = () => ({
                status: 429,
                headers: {},
                body: { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
            });
            server.addGuard(blocker);

            server.route('GET', '/api/tasks', async () => {
                handlerCalled = true;
                return { status: 200, headers: {}, body: { data: [] } };
            });

            const res = await fetch(server, 'GET', '/api/tasks');
            expect(res.status).toBe(429);
            expect(handlerCalled).toBe(false); // handler was never called
            await server.stop();
        });

        it('first guard to return a response wins', async () => {
            const server = await startServer();
            const guard1: Guard = () => ({ status: 401, headers: {}, body: 'unauthorized' });
            const guard2: Guard = () => ({ status: 429, headers: {}, body: 'rate limited' });
            server.addGuard(guard1);
            server.addGuard(guard2);
            server.route('GET', '/', async () => ({ status: 200, headers: {}, body: 'ok' }));
            const res = await fetch(server, 'GET', '/');
            expect(res.status).toBe(401);
            await server.stop();
        });
    });

    describe('after-handler middleware', () => {
        it('middleware can add response headers', async () => {
            const server = await startServer();
            const addHeader: Middleware = (_req, res) => ({
                ...res,
                headers: { ...res.headers, 'X-Custom': 'test' },
            });
            server.use(addHeader);
            server.route('GET', '/', async () => ({ status: 200, headers: {}, body: 'ok' }));
            const res = await fetch(server, 'GET', '/');
            expect(res.headers.get('X-Custom')).toBe('test');
            await server.stop();
        });

        it('middleware receives the handler response and can mutate status', async () => {
            const server = await startServer();
            const mutate: Middleware = (_req, res): HttpResponse => ({ ...res, status: 201 });
            server.use(mutate);
            server.route('GET', '/', async () => ({ status: 200, headers: {}, body: 'ok' }));
            const res = await fetch(server, 'GET', '/');
            expect(res.status).toBe(201);
            await server.stop();
        });
    });

    describe('response serialization', () => {
        it('sends object body as JSON', async () => {
            const server = await startServer();
            server.route('GET', '/json', async () => ({
                status: 200,
                headers: {},
                body: { data: [1, 2, 3] },
            }));
            const res = await fetch(server, 'GET', '/json');
            const json = await res.json();
            expect(json).toEqual({ data: [1, 2, 3] });
            await server.stop();
        });

        it('sends string body as text', async () => {
            const server = await startServer();
            server.route('GET', '/text', async () => ({
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
                body: 'hello world',
            }));
            const res = await fetch(server, 'GET', '/text');
            const text = await res.text();
            expect(text).toBe('hello world');
            await server.stop();
        });
    });
});
