# Client Adapters

This directory contains adapter implementations that wrap external dependencies, following the **Dependency Inversion Principle**. By depending on interfaces instead of concrete implementations, we can easily swap underlying technologies without changing business logic.

## Why Adapters?

**Problem:** Hard-coupling to specific libraries makes code rigid and hard to test.

```typescript
// ❌ Tightly coupled to fetch
fetch('http://localhost:4000/api/health')
  .then(res => res.json())
  .then(data => setTodos(data))
```

**Solution:** Depend on interfaces, inject implementations.

```typescript
// ✅ Depends on HttpClient interface
container.httpClient
  .get<ApiResponse<Todo[]>>('/api/tasks')
  .then(data => setTodos(data.data))
```

Now we can:
- Swap fetch → axios in one line
- Add logging/retry logic globally
- Mock HTTP calls in tests

---

## Adapters Overview

### 1. Config Adapter

**Purpose:** Abstract environment variable access

**Interface:** `ConfigProvider` (from `@alle/shared`)

**Implementation:** `ViteConfigProvider` - wraps `import.meta.env`

**Why:** Makes the client build-tool-agnostic. Could swap to webpack env, runtime config, etc.

**Usage:**
```typescript
import { container } from '../container'

const apiUrl = container.config.get('VITE_API_URL', 'http://localhost:4000')
const isDev = container.config.getBoolean('VITE_DEV_MODE', true)
```

### 2. HTTP Client Adapter

**Purpose:** Abstract HTTP request library

**Interface:** `HttpClient` - provides `get()`, `post()`, `put()`, `delete()` methods

**Implementation:** `FetchHttpClient` - wraps native `fetch` API

**Why:** Makes it easy to:
- Swap fetch → axios/ky/custom client
- Add global request/response interceptors
- Mock HTTP calls in tests
- Add retry logic, logging, etc.

**Usage:**
```typescript
import { container } from '../container'
import type { ApiResponse, Todo } from '@alle/shared'

// Type-safe GET request
const tasks = await container.httpClient.get<ApiResponse<Todo[]>>('/api/tasks')

// Type-safe POST request
const newTodo = await container.httpClient.post<ApiResponse<Todo>>(
  '/api/tasks',
  { text: 'Buy milk', date: '2024-01-15' }
)

// Error handling
try {
  await container.httpClient.delete(`/api/tasks/${id}`)
} catch (error) {
  if (error instanceof HttpClientError) {
    console.error(`HTTP ${error.statusCode}: ${error.statusText}`)
  }
}
```

---

## Directory Structure

```
adapters/
├── config/
│   └── ViteConfigProvider.ts       # Wraps import.meta.env
├── http/
│   ├── HttpClient.ts                # Interface
│   ├── FetchHttpClient.ts           # Fetch implementation
│   └── README.md                    # This file
└── README.md
```

---

## Adding Alternative Implementations

### Example 1: Switch from fetch to axios

**Step 1:** Create `AxiosHttpClient.ts`

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios'
import { HttpClient, RequestOptions, HttpClientError } from './HttpClient'

export class AxiosHttpClient implements HttpClient {
  private client: AxiosInstance

  constructor(baseUrl: string = '') {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options)
  }

  async post<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', url, body, options)
  }

  async put<T>(url: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', url, body, options)
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options)
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    try {
      const response = await this.client.request({
        method,
        url,
        data: body,
        headers: options?.headers,
        timeout: options?.timeout,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        throw new HttpClientError(
          axiosError.response?.status || 0,
          axiosError.response?.statusText || 'Network Error',
          axiosError.response?.data
        )
      }
      throw error
    }
  }
}
```

**Step 2:** Install axios

```bash
cd packages/client
bun add axios
```

**Step 3:** Update Container (ONE LINE!)

```typescript
// packages/client/src/container.ts

import { AxiosHttpClient } from './adapters/http/AxiosHttpClient'  // Change import

get httpClient(): HttpClient {
  if (!this._httpClient) {
    const apiUrl = this.config.get('VITE_API_URL', 'http://localhost:4000')
    // Change this ONE line:
    this._httpClient = new AxiosHttpClient(apiUrl)  // ✅ Done!
  }
  return this._httpClient
}
```

**Step 4:** No other changes needed!

All your components making HTTP calls work identically. The business logic doesn't know or care what HTTP library is being used.

---

### Example 2: Add Request/Response Interceptors

Want to add logging, auth headers, or retry logic? Create an interceptor wrapper:

```typescript
import { HttpClient, RequestOptions } from './HttpClient'
import { FetchHttpClient } from './FetchHttpClient'

export class InterceptedHttpClient implements HttpClient {
  private inner: HttpClient

  constructor(baseUrl: string) {
    this.inner = new FetchHttpClient(baseUrl)
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    console.log(`[HTTP] GET ${url}`)
    const start = Date.now()

    try {
      const result = await this.inner.get<T>(url, options)
      console.log(`[HTTP] GET ${url} - ${Date.now() - start}ms`)
      return result
    } catch (error) {
      console.error(`[HTTP] GET ${url} - FAILED`, error)
      throw error
    }
  }

  // Implement other methods similarly...
}
```

Then in container:

```typescript
get httpClient(): HttpClient {
  if (!this._httpClient) {
    const apiUrl = this.config.get('VITE_API_URL', 'http://localhost:4000')
    this._httpClient = new InterceptedHttpClient(apiUrl)
  }
  return this._httpClient
}
```

Now **every HTTP call** in your app gets logged automatically!

---

### Example 3: Add Retry Logic

```typescript
export class RetryHttpClient implements HttpClient {
  private inner: HttpClient
  private maxRetries: number

  constructor(baseUrl: string, maxRetries: number = 3) {
    this.inner = new FetchHttpClient(baseUrl)
    this.maxRetries = maxRetries
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.inner.get<T>(url, options)
      } catch (error) {
        lastError = error as Error

        // Only retry on network errors or 5xx
        if (error instanceof HttpClientError && error.statusCode < 500) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000))
        }
      }
    }

    throw lastError!
  }

  // Implement other methods similarly...
}
```

---

## Testing Strategy

### Unit Tests

Mock the HTTP client to test components in isolation:

```typescript
import { describe, it, expect } from 'bun:test'
import type { HttpClient } from './adapters/http/HttpClient'

class MockHttpClient implements HttpClient {
  private responses = new Map<string, unknown>()

  mockGet<T>(url: string, response: T): void {
    this.responses.set(`GET:${url}`, response)
  }

  async get<T>(url: string): Promise<T> {
    const response = this.responses.get(`GET:${url}`)
    if (!response) throw new Error(`No mock for GET ${url}`)
    return response as T
  }

  // Implement other methods...
}

describe('TaskList component', () => {
  it('should fetch and display tasks', async () => {
    const mockClient = new MockHttpClient()
    mockClient.mockGet('/api/tasks', { data: [{ id: '1', text: 'Test' }] })

    // Inject mock into container for testing
    // Then test component...
  })
})
```

### Integration Tests

Use real HTTP client with test server:

```typescript
describe('HTTP Client', () => {
  it('should make real requests', async () => {
    const client = new FetchHttpClient('http://localhost:4000')

    const response = await client.get('/api/health')
    expect(response).toEqual({ data: { status: 'ok' } })
  })
})
```

---

## Benefits Achieved

✅ **Easy to swap HTTP libraries** - Change fetch → axios in one line
✅ **Easy to test** - Mock HTTP client for unit tests
✅ **Easy to add global behavior** - Logging, retry, auth headers
✅ **Type safety** - Generic methods preserve response types
✅ **Error handling** - Consistent error types across all HTTP calls
✅ **No vendor lock-in** - Not married to any specific HTTP library

---

## Usage in Components

### Before (Direct fetch)

```typescript
function TaskList() {
  const [tasks, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    fetch('http://localhost:4000/api/tasks')
      .then(res => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then(data => setTodos(data.data))
      .catch(err => console.error(err))
  }, [])

  return <div>{/* render tasks */}</div>
}
```

**Problems:**
- Hardcoded URL
- Manual error checking
- Can't swap fetch implementation
- Hard to test (need to mock `fetch` globally)

### After (HttpClient adapter)

```typescript
import { container } from './container'
import type { ApiResponse, Todo } from '@alle/shared'

function TaskList() {
  const [tasks, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    container.httpClient
      .get<ApiResponse<Todo[]>>('/api/tasks')
      .then(response => setTodos(response.data))
      .catch(err => console.error(err))
  }, [])

  return <div>{/* render tasks */}</div>
}
```

**Benefits:**
- No hardcoded URL (from config)
- Automatic error handling
- Type-safe response
- Easy to swap fetch → axios
- Easy to test (mock `container.httpClient`)

---

## Creating Custom Clients

You can create specialized clients for specific needs:

### Example: GraphQL Client

```typescript
export class GraphQLHttpClient implements HttpClient {
  private inner: HttpClient

  constructor(baseUrl: string) {
    this.inner = new FetchHttpClient(baseUrl)
  }

  async get<T>(url: string): Promise<T> {
    // For GraphQL, all requests are POST to /graphql
    throw new Error('Use query() instead')
  }

  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return this.inner.post<T>('/graphql', { query, variables })
  }

  // Other methods throw or delegate to query()...
}
```

### Example: Cached Client

```typescript
export class CachedHttpClient implements HttpClient {
  private inner: HttpClient
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private ttl: number = 60000 // 1 minute

  constructor(baseUrl: string, ttl?: number) {
    this.inner = new FetchHttpClient(baseUrl)
    if (ttl) this.ttl = ttl
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const cached = this.cache.get(url)

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data as T
    }

    const data = await this.inner.get<T>(url, options)
    this.cache.set(url, { data, timestamp: Date.now() })
    return data
  }

  // POST/PUT/DELETE invalidate cache...
}
```

---

## Key Principle

> "Depend on abstractions, not concretions"

Your components depend on `HttpClient` interface, not on `fetch` or `axios` directly. This makes them portable across any HTTP library and easy to test.

---

## Best Practices

1. **Always use the container** - Never import adapters directly in components
   ```typescript
   // ❌ Bad
   import { FetchHttpClient } from './adapters/http/FetchHttpClient'
   const client = new FetchHttpClient(...)

   // ✅ Good
   import { container } from './container'
   const client = container.httpClient
   ```

2. **Use type parameters** - Preserve type safety through the abstraction
   ```typescript
   // ✅ Type-safe response
   const tasks = await client.get<ApiResponse<Todo[]>>('/api/tasks')
   // tasks.data is Todo[] - TypeScript knows!
   ```

3. **Handle errors consistently** - Catch `HttpClientError` for HTTP-specific errors
   ```typescript
   try {
     await client.delete(`/api/tasks/${id}`)
   } catch (error) {
     if (error instanceof HttpClientError) {
       if (error.statusCode === 404) {
         alert('Todo not found')
       } else {
         alert(`Error ${error.statusCode}: ${error.statusText}`)
       }
     }
   }
   ```

4. **Keep adapters thin** - Don't put business logic in adapters, just wrapping code
