/**
 * Alle Todo App - API Server
 *
 * Now using adapter pattern for HTTP server abstraction.
 * This makes it trivial to swap from Bun → Node.js/Express/Fastify
 * by changing one line in the container.
 *
 * No more giant fetch handler - routes are registered individually.
 */

import { API_ROUTES, type ApiResponse } from '@alle/shared'
import { container } from './container'
import type { HttpResponse } from './adapters/http/types'

// Load configuration
const PORT = container.config.getNumber('PORT', 4000)

// Get HTTP server from container
const server = container.httpServer

/**
 * Register routes
 * Each route is a clean, isolated handler function
 */

// Root endpoint - basic hello world
server.route('GET', '/', async (): Promise<HttpResponse> => {
  return {
    status: 200,
    headers: {},
    body: 'Hello from Bun Server!',
  }
})

// Health check endpoint for monitoring
server.route('GET', API_ROUTES.HEALTH, async (): Promise<HttpResponse> => {
  const response: ApiResponse<{ status: string }> = {
    data: { status: 'ok' },
  }

  return {
    status: 200,
    headers: {},
    body: response,
  }
})

/**
 * Start the server
 */
await server.start(PORT)
console.log(`🚀 Server running at http://localhost:${server.getPort()}`)
