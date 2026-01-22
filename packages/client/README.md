# @alle/client

React-based frontend for the Alle task application.

## Purpose

This package contains all client-specific code including:
- React components and UI
- Client-specific adapters (ViteConfigProvider)
- Frontend routing and state management
- Client-side validation and error handling

## Architecture

### Dependency Injection Container

The `container.ts` file provides lazy-initialized dependencies:

```typescript
import { container } from './container'

const httpClient = container.httpClient  // FetchHttpClient
const logger = container.logger          // ConsoleLogger
const config = container.config          // ViteConfigProvider
```

**To swap implementations**, change one line in `container.ts`:

```typescript
// Before: Fetch API
this._httpClient = new FetchHttpClient(apiUrl)

// After: Axios
this._httpClient = new AxiosHttpClient(apiUrl)
```

### Adapter Pattern

Client uses adapters to abstract external dependencies:

**Config** (`adapters/config/`)
- `ViteConfigProvider` - Reads from `import.meta.env`
- Implements `ConfigProvider` from `@alle/shared`

**HTTP Client** (`adapters/http/`)
- Uses `FetchHttpClient` from `@alle/shared`
- Makes requests to API server
- Handles responses and errors

**Logging** (`adapters/logging/`)
- `ConsoleLogger` - Extends `ConsoleLoggerBase` from shared
- Uses `import.meta.env.DEV` for log level

## Project Structure

```
client/
├── src/
│   ├── adapters/
│   │   ├── config/
│   │   │   └── ViteConfigProvider.ts
│   │   └── logging/
│   │       └── ConsoleLogger.ts
│   ├── App.tsx                        # Main React component
│   ├── main.tsx                       # Entry point
│   ├── container.ts                   # DI container
│   └── vite-env.d.ts
├── index.html
├── vite.config.ts
├── .env
└── package.json
```

## What Belongs Here

### ✅ Client-Specific Code

1. **React components**
   ```typescript
   // ✅ YES - UI is client-only
   export function TaskList() {
     const [tasks, setTodos] = useState<Todo[]>([])
     return <div>{/* ... */}</div>
   }
   ```

2. **Client-side state management**
   ```typescript
   // ✅ YES - UI state
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   ```

3. **React hooks**
   ```typescript
   // ✅ YES - Client-side logic
   function useTasks() {
     const [tasks, setTodos] = useState<Todo[]>([])
     useEffect(() => { /* fetch tasks */ }, [])
     return tasks
   }
   ```

4. **Client-side routing**
   ```typescript
   // ✅ YES - Browser navigation
   <BrowserRouter>
     <Routes>
       <Route path="/" element={<Home />} />
     </Routes>
   </BrowserRouter>
   ```

### ❌ What Doesn't Belong

1. **Server-specific code**
   ```typescript
   // ❌ NO - Server concerns
   interface TaskRepository {
     findAll(): Promise<Todo[]>
   }
   // → Move to packages/server/
   ```

2. **Code used by both client and server**
   ```typescript
   // ❌ NO - Both need these types
   interface Todo { id: string; text: string }
   // → Move to packages/shared/
   ```

## Environment Variables

Configured via `.env` file (Vite prefix required):

```env
# API Configuration
VITE_API_URL=http://localhost:4000   # Backend API URL
VITE_PORT=3000                        # Dev server port
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Development

```bash
# Start client (from root)
bun run client

# Or directly
cd packages/client
bun run dev
```

Client runs on port 3000 (configurable via VITE_PORT env var).

## Using the API

Example API usage with shared types:

```typescript
import { container } from './container'
import { API_ROUTES, type Todo, type ApiResponse } from '@alle/shared'

async function fetchTodos() {
  const httpClient = container.httpClient

  const response = await httpClient.get<ApiResponse<Todo[]>>(
    API_ROUTES.TASKS
  )

  return response.data
}

async function createTask(text: string, date: string) {
  const httpClient = container.httpClient

  const response = await httpClient.post<ApiResponse<Todo>>(
    API_ROUTES.TASKS,
    { text, date }
  )

  return response.data
}
```

## Error Handling

Handle API errors gracefully:

```typescript
import { HttpClientError } from '@alle/shared'

try {
  const tasks = await fetchTodos()
} catch (error) {
  if (error instanceof HttpClientError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`)
    // Show user-friendly message
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Form Validation

Use shared constants for client-side validation:

```typescript
import { TASK_CONSTRAINTS } from '@alle/shared'

function TodoForm() {
  const handleSubmit = (text: string) => {
    if (text.length < TASK_CONSTRAINTS.MIN_TEXT_LENGTH) {
      setError('Task text is required')
      return
    }

    if (text.length > TASK_CONSTRAINTS.MAX_TEXT_LENGTH) {
      setError(`Task text must be less than ${TASK_CONSTRAINTS.MAX_TEXT_LENGTH} characters`)
      return
    }

    // Submit to API
    createTask(text, selectedDate)
  }
}
```

## Date Handling

Use the DateProvider adapter for consistent date operations:

```typescript
import { container } from './container'

// Get the date provider from container
const dateProvider = container.dateProvider

// Get dates
const today = dateProvider.today()              // "2026-01-21"
const tomorrow = dateProvider.tomorrow()        // "2026-01-22"

// Format dates
const formatted = dateProvider.formatDate(date, 'long')  // "January 21, 2026"

// Validate dates
if (!dateProvider.isValidDate(dateStr)) {
  setError('Invalid date format')
}

// Date comparisons
if (dateProvider.isPast(dateStr)) {
  // Handle past date
}
```

## Swapping Implementations

### HTTP Client (Fetch → Axios)

1. Create `AxiosHttpClient.ts`:
   ```typescript
   export class AxiosHttpClient implements HttpClient {
     async get<T>(url: string) {
       const response = await axios.get(url)
       return response.data as T
     }
   }
   ```

2. Update `container.ts`:
   ```typescript
   get httpClient(): HttpClient {
     if (!this._httpClient) {
       const apiUrl = this.config.get('VITE_API_URL', 'http://localhost:4000')
       this._httpClient = new AxiosHttpClient(apiUrl)
     }
     return this._httpClient
   }
   ```

3. Done! All components continue working unchanged.

## Best Practices

1. **Use shared types** - Import from `@alle/shared` for type safety
2. **Validate inputs** - Use shared constraints for consistency
3. **Handle errors gracefully** - Provide user-friendly messages
4. **Use adapters** - Access external services through container
5. **Type everything** - Full TypeScript with strict mode
6. **Environment-based config** - Never hardcode API URLs

## Build

```bash
# Production build
bun run build

# Preview production build
bun run preview
```

Build output goes to `dist/` directory.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript (strict mode)
- **HTTP Client**: Fetch API (via FetchHttpClient)
- **Styling**: (To be added - CSS Modules / Tailwind / Styled Components)

## Future Enhancements

- React Router for multi-page navigation
- State management (React Context / Zustand / Redux)
- Form library (React Hook Form)
- Date picker component
- Drag-and-drop for tasks
- Offline support (Service Worker)
- Client-side caching
- Optimistic UI updates
- Animation library (Framer Motion)
- UI component library
