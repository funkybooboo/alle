/**
 * Alle Todo App - API Server
 *
 * Lightweight HTTP server built with Bun
 * Handles API requests for the todo application
 */

import { API_ROUTES, type ApiResponse } from '@alle/shared'
import { container } from './container'

// Load configuration through the config provider (no more direct process.env access)
const PORT = container.config.getNumber('PORT', 4000)
const CORS_ORIGIN = container.config.get('CORS_ORIGIN', '*')
const NODE_ENV = container.config.get('NODE_ENV', 'development')

// CORS headers to allow requests from the React client
const corsHeaders = {
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const server = Bun.serve({
  port: PORT,

  fetch(req) {
    const url = new URL(req.url)

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Root endpoint - basic hello world
    if (url.pathname === '/') {
      return new Response('Hello from Bun Server!', { headers: corsHeaders })
    }

    // Health check endpoint for monitoring
    if (url.pathname === API_ROUTES.HEALTH) {
      const response: ApiResponse<{ status: string }> = {
        data: { status: 'ok' }
      }
      return Response.json(response, { headers: corsHeaders })
    }

    // 404 for all other routes
    return new Response('Not Found', { status: 404, headers: corsHeaders })
  },
})

console.log(`🚀 Server running at http://localhost:${server.port}`)
