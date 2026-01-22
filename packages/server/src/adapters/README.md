# Server Adapters

This directory contains all external dependency adapters for the server. Following the **Adapter Pattern** and **Dependency Inversion Principle**, these abstractions make it trivial to swap implementations without changing business logic.

## Why Adapters?

**Problem**: Hard dependencies couple your code to specific libraries:
- Can't switch from Bun → Node.js without rewriting everything
- Can't test without real databases/HTTP calls
- Can't change logging from console → Sentry without touching every file

**Solution**: Depend on interfaces, not implementations:
- Business logic imports `Logger`, not `ConsoleLogger`
- Routes use `TaskRepository`, not `InMemoryTaskRepository`
- All adapters wired in one place: `container.ts`

## Available Adapters

### 1. Config Provider

**Interface**: `ConfigProvider` (shared)
**Implementation**: `EnvConfigProvider`
**Location**: `config/EnvConfigProvider.ts`

Wraps `process.env` for type-safe configuration access.

**Usage**:
```typescript
import { container } from './container'

const port = container.config.getNumber('PORT', 4000)
const nodeEnv = container.config.get('NODE_ENV', 'development')
```

**Alternative Implementations**:
- `FileConfigProvider` - Load from JSON/YAML files
- `VaultConfigProvider` - Load from HashiCorp Vault
- `RemoteConfigProvider` - Load from config service

---

### 2. HTTP Server

**Interface**: `HttpServer` (server-only)
**Implementation**: `BunHttpServer`
**Location**: `http/BunHttpServer.ts`

Wraps Bun's `serve()` for receiving HTTP requests.

**Features**:
- Route-based architecture (no giant fetch handler)
- Built-in CORS handling
- Path parameter support (`/api/tasks/:id`)
- Type-safe request/response abstractions

**Usage**:
```typescript
import { container } from './container'

const server = container.httpServer

server.route('GET', '/api/tasks/:id', async (req) => {
  return { status: 200, headers: {}, body: { data: tasks } }
})

await server.start(4000)
```

**Alternative Implementations**:
- `ExpressHttpServer` - Use Express.js
- `FastifyHttpServer` - Use Fastify
- `NodeHttpServer` - Use native Node.js http

---

### 3. HTTP Client

**Interface**: `HttpClient` (shared)
**Implementation**: `BunHttpClient`
**Location**: `http/BunHttpClient.ts`

Wraps fetch for making OUTBOUND HTTP requests to external services (Stripe, Auth0, etc.)

**Usage**:
```typescript
import { container } from './container'

const client = container.httpClient

const response = await client.post('https://api.stripe.com/v1/charges', {
  amount: 1000,
  currency: 'usd',
}, {
  headers: { 'Authorization': `Bearer ${key}` }
})
```

**Alternative Implementations**:
- `AxiosHttpClient` - Use axios library
- `KyHttpClient` - Use ky library
- `RetryHttpClient` - Wrapper with retry logic

---

### 4. Todo Repository

**Interface**: `TaskRepository` (shared)
**Implementation**: `InMemoryTaskRepository`
**Location**: `data/InMemoryTaskRepository.ts`

Abstracts task data persistence.

**Usage**:
```typescript
import { container } from './container'

const repo = container.taskRepository

const todo = await repo.create({ text: 'Buy milk', date: '2026-01-20' })
const tasks = await repo.findAll()
await repo.update(todo.id, { completed: true })
await repo.delete(todo.id)
```

**Alternative Implementations**:
- `PostgresTaskRepository` - Use PostgreSQL database
- `MongoTaskRepository` - Use MongoDB
- `RedisTaskRepository` - Use Redis for fast in-memory with persistence

---

### 5. Logger

**Interface**: `Logger` (shared)
**Implementation**: `ConsoleLogger`
**Location**: `logging/ConsoleLogger.ts`

Wraps `console.*` for consistent logging.

**Usage**:
```typescript
import { container } from './container'

const logger = container.logger

logger.info('Server started', { port: 4000 })
logger.warn('Rate limit approaching', { remaining: 10 })
logger.error('Database connection failed', error, { host: 'localhost' })
logger.debug('Request received', { method: 'GET', path: '/api/tasks' })
```

**Features**:
- Structured logging with context
- Log level filtering (debug/info/warn/error)
- Automatic timestamp formatting
- Error stack traces

**Alternative Implementations**:
- `SentryLogger` - Send errors to Sentry
- `DatadogLogger` - Send logs to Datadog
- `FileLogger` - Write logs to files
- `JSONLogger` - Output as JSON for log aggregators

---

## Container-Based Dependency Injection

All adapters are wired in `container.ts`:

```typescript
export class Container {
  private _config: ConfigProvider | null = null
  private _httpServer: HttpServer | null = null
  private _httpClient: HttpClient | null = null
  private _taskRepository: TaskRepository | null = null
  private _logger: Logger | null = null

  get config(): ConfigProvider {
    if (!this._config) {
      this._config = new EnvConfigProvider()
    }
    return this._config
  }

  // ... other getters with lazy initialization
}

export const container = new Container()
```

**Benefits**:
- **Single source of truth**: All dependencies in one place
- **Lazy initialization**: Only create what you need
- **Easy testing**: Mock entire container or individual dependencies
- **Zero coupling**: Business logic never imports concrete classes

---

## Key Principles

1. **Depend on Interfaces**: Never import concrete adapter classes in business logic
2. **Single Responsibility**: Each adapter wraps ONE external dependency
3. **Open/Closed**: Easy to add new implementations without changing existing code
4. **Liskov Substitution**: Any implementation of an interface should work identically
5. **Dependency Inversion**: High-level code doesn't depend on low-level details

## Summary

**Before Adapters** (Hard Dependencies):
```typescript
// Coupled to Bun
const server = Bun.serve({ ... })

// Coupled to console
console.log('Server started')

// Coupled to Map
const tasks = new Map<string, Todo>()
```

**After Adapters** (Loose Coupling):
```typescript
// Depends on interface
const server = container.httpServer
const logger = container.logger
const repo = container.taskRepository

// Swap implementations by changing ONE line in container.ts
```

This pattern makes the codebase **maintainable**, **testable**, and **flexible** as requirements evolve.
