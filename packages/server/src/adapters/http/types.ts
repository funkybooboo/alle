/**
 * HTTP types for server abstraction
 *
 * These types define the contract for HTTP requests and responses
 * in a runtime-agnostic way. This allows us to swap server implementations
 * (Bun, Node.js, Express, Fastify, etc.) without changing route handlers.
 */

/**
 * HTTP request abstraction
 * Wraps the native request object to provide a consistent interface
 */
export interface HttpRequest {
    method: string;
    url: string;
    headers: Record<string, string>;

    /**
     * Parse the request body as JSON
     */
    json<T>(): Promise<T>;

    /**
     * Get the request body as text
     */
    text(): Promise<string>;
}

/**
 * HTTP response abstraction
 * Represents the response to send back to the client
 *
 * `body` is either a plain text string or a plain data object/array (sent as JSON).
 * `null` is excluded — handlers that produce no body should use an empty string or
 * an empty object instead.
 */
export interface HttpResponse {
    status: number;
    headers: Record<string, string>;
    body: string | object;
}

/**
 * Route handler function type
 * Handles an HTTP request and returns a response
 */
export type RouteHandler = (req: HttpRequest) => Promise<HttpResponse> | HttpResponse;

/**
 * Middleware function type.
 * Runs AFTER a route handler — use it to mutate the response (e.g. add security headers).
 * To short-circuit a request before the handler runs, use Guard instead.
 */
export type Middleware = (req: HttpRequest, res: HttpResponse) => HttpResponse;

/**
 * Guard function type.
 * Runs BEFORE the route handler. Return an HttpResponse to short-circuit the request
 * (e.g. rate limiting), or return null to let the request continue to the handler.
 */
export type Guard = (req: HttpRequest) => HttpResponse | null;
