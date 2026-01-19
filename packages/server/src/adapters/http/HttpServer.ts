/**
 * HTTP Server abstraction interface
 *
 * Provides a runtime-agnostic way to create and manage an HTTP server.
 * This allows us to swap implementations (Bun, Node.js, Express, Fastify, etc.)
 * by changing one line in the container.
 */

import { RouteHandler } from './types'

/**
 * HTTP Server configuration options
 */
export interface HttpServerConfig {
  corsOrigin?: string
  corsHeaders?: Record<string, string>
}

/**
 * HTTP Server interface
 * Provides methods for registering routes and managing the server lifecycle
 */
export interface HttpServer {
  /**
   * Register a route handler
   * @param method - HTTP method (GET, POST, PUT, DELETE, OPTIONS)
   * @param path - Route path (e.g., '/api/health')
   * @param handler - Handler function that processes the request
   */
  route(method: string, path: string, handler: RouteHandler): void

  /**
   * Start the server on the specified port
   * @param port - Port number to listen on
   */
  start(port: number): Promise<void>

  /**
   * Stop the server
   */
  stop(): Promise<void>

  /**
   * Get the current server port
   * @returns Port number if server is running, null otherwise
   */
  getPort(): number | null
}
