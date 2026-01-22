# @alle/server

Bun-based API server for the Alle task application.

## Purpose

This package contains all server-specific code including:
- HTTP server implementation (Bun)
- Server-specific adapters (EnvConfigProvider, BunHttpServer)
- Data persistence (TaskRepository, InMemoryTaskRepository)
- API routes and request handlers
- Server-side validation and error handling

## Architecture

### Dependency Injection Container

The `container.ts` file provides lazy-initialized dependencies:

```typescript
import { container } from './container'

const server = container.httpServer      // BunHttpServer
const taskRepo = container.taskRepository // InMemoryTaskRepository
const logger = container.logger          // ConsoleLogger
const config = container.config          // EnvConfigProvider
```

**To swap implementations**, change one line in `container.ts`:

```typescript
// Before: In-memory
this._taskRepository = new InMemoryTaskRepository()

// After: PostgreSQL
this._taskRepository = new PostgresTaskRepository()
```

### Adapter Pattern

Server uses adapters to abstract external dependencies:

**Config** (`adapters/config/`)
- `EnvConfigProvider` - Reads from `process.env`
- Implements `ConfigProvider` from `@alle/shared`

**HTTP Server** (`adapters/http/`)
- `HttpServer` - Interface for server lifecycle and route registration
- `BunHttpServer` - Bun-specific implementation with:
  - Route registration (METHOD:path pattern)
  - Parameterized routes (`/api/tasks/:id`)
  - CORS handling
  - Request/response abstractions
- `types.ts` - Server-specific HTTP types (`HttpRequest`, `HttpResponse`, `RouteHandler`)

**Data Persistence** (`adapters/data/`)
- `TaskRepository` - Interface for task CRUD operations
- `InMemoryTaskRepository` - In-memory implementation using Map
- Easy to swap for PostgreSQL, MongoDB, Redis, etc.

**Logging** (`adapters/logging/`)
- `ConsoleLogger` - Extends `ConsoleLoggerBase` from shared
- Uses `process.env.NODE_ENV` for log level

## Project Structure

```
server/
├── src/
│   ├── adapters/
│   │   ├── config/
│   │   │   └── EnvConfigProvider.ts
│   │   ├── http/
│   │   │   ├── HttpServer.ts
│   │   │   ├── BunHttpServer.ts
│   │   │   └── types.ts
│   │   ├── data/
│   │   │   ├── TaskRepository.ts           # Server-only interface
│   │   │   └── InMemoryTaskRepository.ts
│   │   └── logging/
│   │       └── ConsoleLogger.ts
│   ├── utils/
│   │   └── errorHandler.ts
│   ├── container.ts
│   └── index.ts                           # Entry point with routes
├── .env
└── package.json
```

## What Belongs Here

### ✅ Server-Specific Code

1. **Data persistence patterns**
   ```typescript
   // ✅ YES - Only server needs repositories
   export interface TaskRepository {
     findAll(): Promise<Todo[]>
     create(input: CreateTaskInput): Promise<Todo>
   }
   ```

2. **Server runtime implementations**
   ```typescript
   // ✅ YES - Bun/Node specific
   export class BunHttpServer implements HttpServer {
     async start(port: number) { /* Bun.serve */ }
   }
   ```

3. **API routes and handlers**
   ```typescript
   // ✅ YES - Server handles HTTP requests
   server.get('/api/tasks', async (req, res) => {
     const tasks = await taskRepo.findAll()
     return { data: tasks }
   })
   ```

4. **Server-side validation**
   ```typescript
   // ✅ YES - Server must validate all inputs
   if (text.length > TASK_CONSTRAINTS.MAX_TEXT_LENGTH) {
     throw new ValidationError('Text too long')
   }
   ```

### ❌ What Doesn't Belong

1. **Client-specific code**
   ```typescript
   // ❌ NO - React is client-only
   function TaskList() { return <div /> }
   // → Move to packages/client/
   ```

2. **Code used by both client and server**
   ```typescript
   // ❌ NO - Both need these types
   interface Todo { id: string; text: string }
   // → Move to packages/shared/
   ```

## Environment Variables

Configured via `.env` file or environment:

```env
# Server Configuration
PORT=4000                   # Server port
NODE_ENV=development        # Environment (development, production)

# CORS
CORS_ORIGIN=*              # Allowed origins (* for all, or specific URL)
```

## API Routes

Defined in `src/index.ts`:

```typescript
// Health check
GET /api/health

// Task CRUD
GET    /api/tasks           // List all tasks
GET    /api/tasks/:id       // Get single task
POST   /api/tasks           // Create task
PUT    /api/tasks/:id       // Update task
DELETE /api/tasks/:id       // Delete task
```

## Request/Response Format

All API responses follow the `ApiResponse<T>` format from `@alle/shared`:

```typescript
// Success
{
  "data": { /* todo object */ }
}

// Error
{
  "error": "ValidationError",
  "message": "Text is required",
  "statusCode": 400
}
```

## Error Handling

Errors are handled centrally in `utils/errorHandler.ts`:

```typescript
import { NotFoundError, ValidationError } from '@alle/shared'

// Throw typed errors
throw new NotFoundError('Todo not found')

// Auto-converted to HTTP responses
{
  error: "NotFoundError",
  message: "Todo not found",
  statusCode: 404
}
```

## Development

```bash
# Start server (from root)
bun run server

# Or directly
cd packages/server
bun run dev
```

Server runs on port 4000 (configurable via PORT env var).

## Testing

```bash
# Health check
curl http://localhost:4000/api/health

# Create task
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"Test task","date":"2026-01-21"}'

# List tasks
curl http://localhost:4000/api/tasks
```

## Swapping Implementations

### Database (InMemory → PostgreSQL)

1. Create `PostgresTaskRepository.ts`:
   ```typescript
   export class PostgresTaskRepository implements TaskRepository {
     async findAll() {
       return await db.query('SELECT * FROM tasks')
     }
   }
   ```

2. Update `container.ts`:
   ```typescript
   get taskRepository(): TaskRepository {
     if (!this._taskRepository) {
       this._taskRepository = new PostgresTaskRepository()
     }
     return this._taskRepository
   }
   ```

3. Done! All routes continue working unchanged.

### Server Runtime (Bun → Express)

1. Create `ExpressHttpServer.ts` implementing `HttpServer`
2. Update `container.ts` to use `ExpressHttpServer`
3. Business logic stays the same

## Best Practices

1. **Validate all inputs** - Never trust client data
2. **Use adapters** - Keep external dependencies swappable
3. **Type everything** - Full TypeScript with strict mode
4. **Centralize errors** - Use custom error classes from shared
5. **Log appropriately** - Use logger, not console.log
6. **Environment-based config** - Never hardcode values

## Future Enhancements

- Database integration (PostgreSQL recommended)
- Authentication & authorization
- Rate limiting
- Caching (Redis)
- WebSocket support for real-time updates
- API versioning
- Request validation middleware (Zod)
