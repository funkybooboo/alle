/**
 * Alle Todo App - API Server
 *
 * Now using adapter pattern for HTTP server abstraction.
 * This makes it trivial to swap from Bun → Node.js/Express/Fastify
 * by changing one line in the container.
 *
 * No more giant fetch handler - routes are registered individually.
 */

import {
  API_ROUTES,
  type ApiResponse,
  type CreateTodoInput,
  type UpdateTodoInput,
  TODO_CONSTRAINTS,
  BadRequestError,
} from '@alle/shared'
import { container } from './container'
import type { HttpRequest, HttpResponse } from './adapters/http/types'
import { errorToResponse, validationError, notFoundError } from './utils/errorHandler'

// Load configuration
const PORT = container.config.getNumber('PORT', 4000)

// Get dependencies from container
const server = container.httpServer
const todoRepo = container.todoRepository
const logger = container.logger

/**
 * Helper functions
 */

// Wrap route handler with automatic error handling
type RouteHandlerFn = (req: HttpRequest) => Promise<HttpResponse>
function withErrorHandling(handler: RouteHandlerFn): RouteHandlerFn {
  return async (req: HttpRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      return errorToResponse(error, logger)
    }
  }
}

// Extract ID from URL path like /api/todos/123
function extractIdFromPath(url: string): string | null {
  const match = url.match(/\/api\/todos\/([^/?]+)/)
  return match ? match[1] : null
}

// Extract query parameter from URL
function getQueryParam(url: string, param: string): string | null {
  const urlObj = new URL(url, 'http://localhost')
  return urlObj.searchParams.get(param)
}

// Create success response
function successResponse<T>(data: T, status = 200): HttpResponse {
  const response: ApiResponse<T> = { data }
  return {
    status,
    headers: {},
    body: response,
  }
}

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
 * Todo CRUD Routes
 */

// GET /api/todos - Get all todos (optionally filtered by date)
server.route('GET', API_ROUTES.TODOS, withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
  const date = getQueryParam(req.url, 'date')
  const todos = date ? await todoRepo.findByDate(date) : await todoRepo.findAll()
  return successResponse(todos)
}))

// POST /api/todos - Create a new todo
server.route('POST', API_ROUTES.TODOS, withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
  const input = await req.json<CreateTodoInput>()

  // Validate input
  if (!input.text || typeof input.text !== 'string') {
    throw validationError('Text is required')
  }

  if (input.text.length < TODO_CONSTRAINTS.MIN_TEXT_LENGTH) {
    throw validationError(`Text must be at least ${TODO_CONSTRAINTS.MIN_TEXT_LENGTH} character`)
  }

  if (input.text.length > TODO_CONSTRAINTS.MAX_TEXT_LENGTH) {
    throw validationError(`Text must not exceed ${TODO_CONSTRAINTS.MAX_TEXT_LENGTH} characters`)
  }

  if (!input.date || typeof input.date !== 'string') {
    throw validationError('Date is required (ISO 8601 format)')
  }

  // Create the todo
  const todo = await todoRepo.create(input)

  return successResponse(todo, 201)
}))

// GET /api/todos/:id - Get a single todo by ID
server.route('GET', '/api/todos/:id', withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
  const id = extractIdFromPath(req.url)
  if (!id) {
    throw new BadRequestError('Invalid todo ID')
  }

  const todo = await todoRepo.findById(id)
  if (!todo) {
    throw notFoundError('Todo', id)
  }

  return successResponse(todo)
}))

// PUT /api/todos/:id - Update a todo
server.route('PUT', '/api/todos/:id', withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
  const id = extractIdFromPath(req.url)
  if (!id) {
    throw new BadRequestError('Invalid todo ID')
  }

  const input = await req.json<UpdateTodoInput>()

  // Validate input
  if (input.text !== undefined) {
    if (typeof input.text !== 'string') {
      throw validationError('Text must be a string')
    }

    if (input.text.length < TODO_CONSTRAINTS.MIN_TEXT_LENGTH) {
      throw validationError(`Text must be at least ${TODO_CONSTRAINTS.MIN_TEXT_LENGTH} character`)
    }

    if (input.text.length > TODO_CONSTRAINTS.MAX_TEXT_LENGTH) {
      throw validationError(`Text must not exceed ${TODO_CONSTRAINTS.MAX_TEXT_LENGTH} characters`)
    }
  }

  if (input.completed !== undefined && typeof input.completed !== 'boolean') {
    throw validationError('Completed must be a boolean')
  }

  if (input.date !== undefined && typeof input.date !== 'string') {
    throw validationError('Date must be a string (ISO 8601 format)')
  }

  // Update the todo
  const todo = await todoRepo.update(id, input)
  if (!todo) {
    throw notFoundError('Todo', id)
  }

  return successResponse(todo)
}))

// DELETE /api/todos/:id - Delete a todo
server.route('DELETE', '/api/todos/:id', withErrorHandling(async (req: HttpRequest): Promise<HttpResponse> => {
  const id = extractIdFromPath(req.url)
  if (!id) {
    throw new BadRequestError('Invalid todo ID')
  }

  const deleted = await todoRepo.delete(id)
  if (!deleted) {
    throw notFoundError('Todo', id)
  }

  return successResponse({ success: true })
}))

/**
 * Start the server
 */
await server.start(PORT)
logger.info(`🚀 Server running at http://localhost:${server.getPort()}`)
