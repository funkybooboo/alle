# @alle/shared

Runtime-agnostic code used by **BOTH** client and server packages.

## Purpose

This package contains the shared foundation that ensures type safety and consistency across the full stack. Code here must work in both browser (client) and Bun (server) runtimes.

## What's Included

### Types (`src/types/`)
Data models and API contracts:
- `Todo`, `CreateTaskInput`, `UpdateTaskInput` - Core task types
- `ApiResponse<T>`, `ApiError` - Standard API response wrappers
- `TaskApi` - Type-safe API endpoint definitions

### Adapter Interfaces (`src/adapters/`)
Runtime-agnostic contracts implemented differently per environment:

**Config** (`adapters/config/`)
- `ConfigProvider` - Interface for runtime-agnostic config access
- `ConfigError` - Config-related errors
- **Implementations:**
  - `ViteConfigProvider` (client) - reads `import.meta.env`
  - `EnvConfigProvider` (server) - reads `process.env`

**HTTP Client** (`adapters/http/`)
- `HttpClient` - Interface for HTTP operations
- `FetchHttpClient` - Universal implementation (fetch API works in both runtimes)
- `HttpClientError` - HTTP client errors
- `RequestOptions` - HTTP request configuration

**Logging** (`adapters/logging/`)
- `Logger` - Interface defining logging contract
- `LogLevel` - Log level enum (Debug, Info, Warn, Error)
- `ConsoleLoggerBase` - Base class with common logging logic
- **Implementations:**
  - `ConsoleLogger` (client) - uses `import.meta.env.DEV`
  - `ConsoleLogger` (server) - uses `process.env.NODE_ENV`

### Constants (`src/constants.ts`)
App-wide constants that must stay in sync:
- `API_ROUTES` - Centralized route definitions
- `TASK_CONSTRAINTS` - Validation rules (text length limits, etc.)

### Date Adapter (`src/adapters/date/`)
Date and time operations using ISO 8601 format:
- `DateProvider` - Interface for date/time operations (15 methods)
- `NativeDateProvider` - Universal implementation using native JavaScript Date
- `DateProviderError` - Date provider errors

### Errors (`src/errors/AppError.ts`)
Custom error classes with HTTP status codes:
- `AppError` (base class)
- `ValidationError` (400)
- `NotFoundError` (404)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `ConflictError` (409)
- `BadRequestError` (400)
- `InternalServerError` (500)

## Organization Rules

### ✅ What SHOULD Go in Shared

1. **Types used by both client and server**
   ```typescript
   // ✅ YES - Client displays tasks, server persists them
   export interface Todo {
     id: string
     text: string
     completed: boolean
   }
   ```

2. **Interfaces implemented differently per runtime**
   ```typescript
   // ✅ YES - Client and server need config access, but source differs
   export interface ConfigProvider {
     get(key: string, defaultValue?: string): string
   }
   ```

3. **Universal implementations**
   ```typescript
   // ✅ YES - fetch() exists in both browser and Bun
   export class FetchHttpClient implements HttpClient {
     async get(url: string) { /* ... */ }
   }
   ```

4. **API contracts**
   ```typescript
   // ✅ YES - Client and server must agree on API shape
   export interface ApiResponse<T> {
     data: T
     error?: string
   }
   ```

5. **Constants that must stay in sync**
   ```typescript
   // ✅ YES - Client and server must use same routes
   export const API_ROUTES = {
     TASKS: '/api/tasks',
     HEALTH: '/api/health'
   }
   ```

6. **Pure utility functions**
   ```typescript
   // ✅ YES - Date formatting needed by both sides
   export function formatDate(date: string): string { /* ... */ }
   ```

### ❌ What should NOT Go in Shared

1. **Server-only concerns**
   ```typescript
   // ❌ NO - Only server needs data persistence patterns
   export interface TaskRepository {
     findAll(): Promise<Todo[]>
   }
   // → Move to packages/server/
   ```

2. **Client-only code**
   ```typescript
   // ❌ NO - React is client-only
   export function TaskList() {
     return <div>...</div>
   }
   // → Move to packages/client/
   ```

3. **Runtime-specific implementations**
   ```typescript
   // ❌ NO - process.env is Node/Bun specific
   export class EnvConfigProvider {
     get(key: string) {
       return process.env[key]
     }
   }
   // → Move to packages/server/
   ```

4. **Code used in only one place**
   ```typescript
   // ❌ NO - If only server uses it, keep it there
   export function serverOnlyHelper() { /* ... */ }
   // → Move to appropriate package
   ```

## Decision Tree

When creating new code, ask yourself:

```
Does the CLIENT need this code?
├─ NO → Put in server/ package
└─ YES
   └─ Does the SERVER also need it?
      ├─ NO → Put in client/ package
      └─ YES → Put in shared/ package
```

**Examples:**
- `Todo` type → Client displays, server persists → **shared/**
- `TaskRepository` interface → Only server persists → **server/**
- `TaskList` component → Only client renders → **client/**
- `API_ROUTES` constants → Both need same routes → **shared/**

## Import Guidelines

### In Client
```typescript
import { type Todo, API_ROUTES, type Logger } from '@alle/shared'
```

### In Server
```typescript
import { type Todo, type DateProvider, ValidationError } from '@alle/shared'
```

### Never Import
- Client should NOT import server code
- Server should NOT import client code
- Shared should NOT import from client or server

## Best Practices

1. **Keep it lean** - Only add to shared if truly needed by both sides
2. **No side effects** - Shared code should be pure and predictable
3. **Runtime-agnostic** - No browser-only or Node-only APIs
4. **Type-first** - Prefer interfaces and types over implementations
5. **Document why** - If placement is unclear, add a comment explaining

## When to Move Code

**From shared to server:**
- Client stops using it (example: TaskRepository)
- Code becomes server-specific

**From shared to client:**
- Server stops using it
- Code becomes client-specific

**From client/server to shared:**
- Other side starts needing it
- Want to ensure consistency across stack

## Package Scripts

```bash
# In root
bun install        # Install dependencies
bun run dev        # Start client and server
```

## Dependencies

- **Dev only**: TypeScript
- **Runtime**: None (pure TypeScript)

## Exports

All public APIs are exported through `src/index.ts`. Import from the package root:

```typescript
// ✅ DO
import { Todo, API_ROUTES } from '@alle/shared'

// ❌ DON'T
import { Todo } from '@alle/shared/src/types/todo'
```

## Future Considerations

- **Validation schemas** - Consider Zod for shared validation rules
- **Type-safe API client** - Type-safe wrapper around HttpClient
- **Environment-specific builds** - Tree-shaking for unused code
- **Runtime-agnostic server** - If supporting multiple server runtimes
