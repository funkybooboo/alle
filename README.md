# Alle

A modern todo application inspired by TeuxDeux, built with React and Bun.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Bun HTTP Server + TypeScript
- **Package Manager**: Bun
- **Architecture**: Monorepo with shared dependencies

## Project Structure

```
alle/
├── packages/
│   ├── client/          # React frontend (port 3000)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── vite-env.d.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   └── vite.config.ts
│   ├── server/          # Bun API server (port 4000)
│   │   └── src/
│   │       └── index.ts
│   └── shared/          # Shared types and utilities
│       └── src/
│           ├── types/   # Todo, API types
│           ├── constants.ts
│           └── index.ts
├── package.json         # Root workspace config
└── README.md
```

## Prerequisites

- [Bun](https://bun.sh) (latest version)

## Getting Started

### Installation

```bash
# Install dependencies
bun install

# Copy environment files (already set up with defaults)
# Client: packages/client/.env
# Server: packages/server/.env
```

### Configuration

Environment variables are managed through `.env` files in each package:

**Server** (`packages/server/.env`):
```env
PORT=4000                  # Server port
CORS_ORIGIN=*              # CORS allowed origins
NODE_ENV=development       # Environment
```

**Client** (`packages/client/.env`):
```env
VITE_API_URL=http://localhost:4000   # API server URL
VITE_PORT=3000                       # Client dev server port
```

See `.env.example` files in each package for reference.

### Development

```bash
# Start both client and server
bun run dev

# Start client only (port 3000)
bun run client

# Start server only (port 4000)
bun run server
```

The dev command automatically cleans up any processes on ports 3000 and 4000 before starting.

### Stopping Servers

Press `Ctrl+C` to stop all running servers. The shutdown is handled gracefully by concurrently.

If servers don't stop properly:

```bash
bun run kill-ports
```

## Available Scripts

- `bun run dev` - Start both client and server with auto-cleanup
- `bun run client` - Start React dev server on port 3000
- `bun run server` - Start Bun API server on port 4000
- `bun run kill-ports` - Kill any processes on ports 3000 and 4000
- `bun run type-check` - Run TypeScript type checking (client only)

## Development URLs

- **Client**: http://localhost:3000
- **Server**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

## Features

- Monorepo architecture with Bun workspaces
- **Shared type library** for type-safe client-server communication
- Full TypeScript support on client and server
- Hot module replacement (HMR) for React
- Auto-reload for Bun server
- Type-safe environment variables
- CORS enabled for local development
- Clean startup/shutdown with automatic port cleanup
- Color-coded console output (server: blue, client: green)

## Shared Package (`@alle/shared`)

The shared package contains types, constants, and utilities used by both client and server, ensuring type safety across the full stack.

**What's included:**
- `Todo` - Core todo type
- `CreateTodoInput`, `UpdateTodoInput` - Input types for mutations
- `ApiResponse<T>`, `ApiError` - Standard API response wrappers
- `TodoApi` - Type-safe API endpoint definitions
- `API_ROUTES` - Centralized route constants
- `TODO_CONSTRAINTS` - Validation rules

**Usage example:**
```typescript
// In client or server
import { type Todo, API_ROUTES, TODO_CONSTRAINTS } from '@alle/shared'

const todo: Todo = { /* ... */ }
fetch(`${API_URL}${API_ROUTES.HEALTH}`)
```

**Why this matters:**
- Change a type once, TypeScript catches issues everywhere
- No API contract mismatches between client/server
- Refactoring is safe and easy
- Zero runtime overhead (types are erased at build time)

**What should go in shared:**
- ✅ Types used by both client and server
- ✅ API request/response interfaces
- ✅ Constants that must stay in sync
- ✅ Pure utility functions (no side effects)

**What should NOT go in shared:**
- ❌ React components or hooks
- ❌ Server-only code (database, middleware)
- ❌ Client-only code (UI state, context)
- ❌ Code used in only one place

## 12-Factor App Compliance

The application follows 12-factor principles:

- **Stateless**: No local state stored on server
- **Config**: Environment-based configuration (ready for env vars)
- **Backing services**: Designed for external service integration
- **Port binding**: Self-contained with explicit port declarations
- **Disposability**: Fast startup and graceful shutdown
- **Dev/prod parity**: Same tech stack across environments

## Docker Ready

The application is designed to be easily containerized:
- Stateless architecture
- Explicit port configuration
- Bun's single binary runtime
- No build artifacts required for development

## Next Steps

- [ ] Implement todo CRUD operations
- [ ] Add database integration
- [ ] Create Docker configuration
- [ ] Add authentication
- [ ] Build out TeuxDeux-inspired UI

## License

MIT
