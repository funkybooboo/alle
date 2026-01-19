# @alle/shared

Shared TypeScript types, constants, and utilities for the Alle todo application.

## Purpose

This package ensures type-safe communication between the client and server by providing:
- A single source of truth for data types
- Shared API contracts
- Common validation rules and constants

## What's Included

### Types

**`Todo`** - Core todo data type
```typescript
interface Todo {
  id: string
  text: string
  completed: boolean
  date: string
  createdAt: string
  updatedAt: string
}
```

**`CreateTodoInput`** - Input for creating todos
```typescript
type CreateTodoInput = Pick<Todo, 'text' | 'date'>
```

**`UpdateTodoInput`** - Input for updating todos
```typescript
type UpdateTodoInput = Partial<Pick<Todo, 'text' | 'completed' | 'date'>>
```

**`ApiResponse<T>`** - Standard API response wrapper
```typescript
interface ApiResponse<T> {
  data: T
  message?: string
}
```

**`ApiError`** - API error response
```typescript
interface ApiError {
  error: string
  message: string
  statusCode: number
}
```

### Constants

**`API_ROUTES`** - Centralized API route definitions
```typescript
{
  TODOS: '/api/todos',
  TODO_BY_ID: (id: string) => `/api/todos/${id}`,
  HEALTH: '/api/health'
}
```

**`TODO_CONSTRAINTS`** - Validation rules
```typescript
{
  MAX_TEXT_LENGTH: 500,
  MIN_TEXT_LENGTH: 1
}
```

## Usage

Import types and constants from the shared package:

```typescript
// In client (React)
import { type Todo, API_ROUTES } from '@alle/shared'

const fetchTodos = async () => {
  const response = await fetch(`${API_URL}${API_ROUTES.TODOS}`)
  const data: ApiResponse<Todo[]> = await response.json()
  return data.data
}
```

```typescript
// In server (Bun)
import { type Todo, type ApiResponse, API_ROUTES } from '@alle/shared'

if (url.pathname === API_ROUTES.TODOS) {
  const todos: Todo[] = await db.getTodos()
  const response: ApiResponse<Todo[]> = { data: todos }
  return Response.json(response)
}
```

## Guidelines

### DO ✅
- Add types used by both client and server
- Add pure utility functions (no side effects)
- Add constants that must stay in sync
- Keep types minimal and focused

### DON'T ❌
- Add React components
- Add server-only code (database, middleware)
- Add client-only code (hooks, context)
- Add code that's only used in one place

## Development

```bash
# Type check the shared package
bun run type-check
```

The shared package requires no build step - Bun and Vite consume TypeScript directly.
