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
  method: string
  url: string
  headers: Record<string, string>

  /**
   * Parse the request body as JSON
   */
  json<T>(): Promise<T>

  /**
   * Get the request body as text
   */
  text(): Promise<string>
}

/**
 * HTTP response abstraction
 * Represents the response to send back to the client
 */
export interface HttpResponse {
  status: number
  headers: Record<string, string>
  body: string | object | null
}

/**
 * Route handler function type
 * Handles an HTTP request and returns a response
 */
export type RouteHandler = (
  req: HttpRequest
) => Promise<HttpResponse> | HttpResponse
