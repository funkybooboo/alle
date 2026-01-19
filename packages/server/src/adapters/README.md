# Server Adapters

This directory contains adapter implementations that wrap external dependencies, following the **Dependency Inversion Principle**. By depending on interfaces instead of concrete implementations, we can easily swap underlying technologies without changing business logic.

## Why Adapters?

**Problem:** Hard-coupling to specific libraries makes code rigid and hard to test.

```typescript
// ❌ Tightly coupled to Bun
const server = Bun.serve({
  port: 4000,
  fetch(req) { /* routes mixed with server setup */ }
})
```

**Solution:** Depend on interfaces, inject implementations.

```typescript
// ✅ Depends on HttpServer interface
const server = container.httpServer
server.route('GET', '/api/health', handler)
```

Now we can swap Bun → Node.js/Express/Fastify by changing **one line** in the container.

---

## Adapters Overview

### 1. Config Adapter

**Purpose:** Abstract environment variable access

**Interface:** `ConfigProvider` (from `@alle/shared`)

**Implementation:** `EnvConfigProvider` - wraps `process.env`

**Why:** Makes the server runtime-agnostic. Could swap to file-based config, database config, etc.

**Usage:**
```typescript
import { container } from '../container'

const port = container.config.getNumber('PORT', 4000)
const corsOrigin = container.config.get('CORS_ORIGIN', '*')
```

### 2. HTTP Server Adapter

**Purpose:** Abstract HTTP server implementation

**Interface:** `HttpServer` - provides `route()`, `start()`, `stop()` methods

**Implementation:** `BunHttpServer` - wraps `Bun.serve()`

**Why:** Makes it trivial to switch runtimes (Bun → Node.js → Deno) without touching route handlers.

**Usage:**
```typescript
import { container } from '../container'
import type { HttpRequest, HttpResponse } from './adapters/http/types'

const server = container.httpServer

server.route('GET', '/api/todos', async (req: HttpRequest): Promise<HttpResponse> => {
  return {
    status: 200,
    headers: {},
    body: { todos: [] }
  }
})

await server.start(4000)
```

---

## Directory Structure

```
adapters/
├── config/
│   └── EnvConfigProvider.ts        # Wraps process.env
├── http/
│   ├── HttpServer.ts                # Interface
│   ├── BunHttpServer.ts             # Bun implementation
│   └── types.ts                     # HttpRequest/HttpResponse types
└── README.md                        # This file
```

---

## Adding Alternative Implementations

### Example: Switch from Bun to Express

**Step 1:** Create `ExpressHttpServer.ts`

```typescript
import express, { Express, Request, Response } from 'express'
import { HttpServer, HttpServerConfig } from './HttpServer'
import { HttpRequest, HttpResponse, RouteHandler } from './types'

export class ExpressHttpServer implements HttpServer {
  private app: Express
  private server: ReturnType<typeof this.app.listen> | null = null
  private config: HttpServerConfig

  constructor(config: HttpServerConfig = {}) {
    this.app = express()
    this.config = config

    // Setup CORS middleware
    this.app.use((req, res, next) => {
      const corsHeaders = this.config.corsHeaders || {}
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
      if (req.method === 'OPTIONS') {
        res.sendStatus(204)
        return
      }
      next()
    })

    this.app.use(express.json())
  }

  route(method: string, path: string, handler: RouteHandler): void {
    const expressHandler = async (req: Request, res: Response) => {
      const httpReq: HttpRequest = {
        method: req.method,
        url: req.url,
        headers: req.headers as Record<string, string>,
        json: async () => req.body,
        text: async () => JSON.stringify(req.body),
      }

      const response = await handler(httpReq)

      res.status(response.status)
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })

      if (typeof response.body === 'object' && response.body !== null) {
        res.json(response.body)
      } else {
        res.send(response.body)
      }
    }

    switch (method.toUpperCase()) {
      case 'GET': this.app.get(path, expressHandler); break
      case 'POST': this.app.post(path, expressHandler); break
      case 'PUT': this.app.put(path, expressHandler); break
      case 'DELETE': this.app.delete(path, expressHandler); break
    }
  }

  async start(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => resolve())
    })
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => err ? reject(err) : resolve())
      } else {
        resolve()
      }
    })
  }

  getPort(): number | null {
    const address = this.server?.address()
    return typeof address === 'object' && address ? address.port : null
  }
}
```

**Step 2:** Install Express

```bash
cd packages/server
bun add express
bun add -d @types/express
```

**Step 3:** Update Container (ONE LINE!)

```typescript
// packages/server/src/container.ts

import { ExpressHttpServer } from './adapters/http/ExpressHttpServer'  // Change import

get httpServer(): HttpServer {
  if (!this._httpServer) {
    const corsOrigin = this.config.get('CORS_ORIGIN', '*')
    // Change this ONE line:
    this._httpServer = new ExpressHttpServer({ corsOrigin })  // ✅ Done!
  }
  return this._httpServer
}
```

**Step 4:** No other changes needed!

All your route handlers in `index.ts` work identically. The business logic doesn't know or care what HTTP server is running underneath.

---

## Testing Strategy

### Unit Tests

Mock the adapters to test business logic in isolation:

```typescript
import { describe, it, expect, beforeEach } from 'bun:test'
import type { ConfigProvider } from '@alle/shared'

class MockConfigProvider implements ConfigProvider {
  private values = new Map<string, string>()

  constructor(initialValues: Record<string, string> = {}) {
    Object.entries(initialValues).forEach(([k, v]) => {
      this.values.set(k, v)
    })
  }

  get(key: string, defaultValue?: string): string {
    return this.values.get(key) ?? defaultValue ?? ''
  }

  getNumber(key: string, defaultValue?: number): number {
    return Number(this.get(key, defaultValue?.toString()))
  }

  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.get(key, defaultValue?.toString())
    return value === 'true' || value === '1'
  }

  has(key: string): boolean {
    return this.values.has(key)
  }
}

describe('Config usage', () => {
  it('should load port from config', () => {
    const config = new MockConfigProvider({ PORT: '3000' })
    expect(config.getNumber('PORT')).toBe(3000)
  })
})
```

### Integration Tests

Use real adapters with test configuration:

```typescript
import { BunHttpServer } from './adapters/http/BunHttpServer'

describe('HTTP Server', () => {
  it('should handle routes', async () => {
    const server = new BunHttpServer()

    server.route('GET', '/test', async () => ({
      status: 200,
      headers: {},
      body: 'test response'
    }))

    await server.start(0) // 0 = random port
    const port = server.getPort()!

    const response = await fetch(`http://localhost:${port}/test`)
    expect(await response.text()).toBe('test response')

    await server.stop()
  })
})
```

---

## Benefits Achieved

✅ **Easy to swap implementations** - Change Bun → Express in one line
✅ **Easy to test** - Mock adapters for unit tests
✅ **Easy to configure** - Swap config sources without touching business logic
✅ **No vendor lock-in** - Not married to any specific runtime or library
✅ **Clean separation** - Business logic (routes) separate from infrastructure (server)

---

## Current Limitations

### Route Matching

The current `BunHttpServer` uses simple string matching (`"METHOD:path"`). This works for:
- ✅ Static routes: `/api/health`, `/api/todos`
- ❌ Dynamic routes: `/api/todos/:id`

**When you need path parameters, you have two options:**

1. **Add path parameter parsing** to `BunHttpServer`:
   ```typescript
   // Use a library like path-to-regexp or URLPattern
   import { match } from 'path-to-regexp'
   ```

2. **Use an existing router library** like `find-my-way` or switch to Express (which has built-in routing).

### Middleware

There's no general middleware system yet. CORS is built into the server config, but if you need request/response interceptors:

```typescript
interface HttpServer {
  use(middleware: Middleware): void  // Add this method
  route(method: string, path: string, handler: RouteHandler): void
}

type Middleware = (req: HttpRequest, next: () => Promise<HttpResponse>) => Promise<HttpResponse>
```

This is **intentionally left out** until you need it - don't over-engineer!

---

## Key Principle

> "Depend on abstractions, not concretions"

Your route handlers depend on `HttpRequest` and `HttpResponse` types, not on Bun's `Request` or Express's `req`/`res` objects. This makes them portable across any runtime.
