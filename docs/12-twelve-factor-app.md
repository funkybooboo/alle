# Twelve-Factor App

This document explains how the Alle project implements the [Twelve-Factor App](https://12factor.net/) methodology for building modern, scalable, cloud-native applications.

## Philosophy

The Twelve-Factor App is a methodology for building software-as-a-service apps that:

- **Scale horizontally** without code changes
- **Deploy consistently** across environments
- **Minimize divergence** between development and production
- **Run portably** on modern cloud platforms
- **Enable continuous deployment** for maximum agility

---

## I. Codebase

**PRINCIPLE**: One codebase tracked in version control, many deploys.

### Alle Implementation

✅ **We have**: Single Git repository with all code
```
alle/
├── packages/client/    # React frontend
├── packages/server/    # Bun API
└── packages/shared/    # Shared types
```

✅ **Multiple deploys** from same codebase:
- Development (`localhost:3000`, `localhost:4000`)
- Staging (`https://staging.alle.app`)
- Production (`https://alle.app`)

❌ **We NEVER**:
- Maintain separate codebases for different environments
- Branch code for different deployments
- Copy code between repositories

---

## II. Dependencies

**PRINCIPLE**: Explicitly declare and isolate dependencies.

### Alle Implementation

✅ **Explicit declaration** in `package.json`:
```json
{
  "dependencies": {
    "react": "18.3.1",
    "postgres": "3.4.3"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "@types/bun": "latest"
  }
}
```

✅ **Dependency isolation**:
```bash
# Install exact versions
bun install

# Lock file ensures consistency
bun.lockb
```

✅ **No system-wide dependencies**:
- All tools installed via package.json
- No reliance on system packages (except Bun runtime)
- Docker for consistent environment

❌ **We NEVER**:
- Rely on system-wide packages
- Assume tools are installed globally
- Use undeclared dependencies

---

## III. Config

**PRINCIPLE**: Store config in environment variables.

### Alle Implementation

✅ **Environment variables** for all config:
```bash
# .env.example
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/alle
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

✅ **ConfigProvider abstraction**:
```typescript
// Adapters abstract env var access
export interface ConfigProvider {
  get(key: string): string;
  getNumber(key: string): number;
  getBoolean(key: string): boolean;
}

export class EnvConfigProvider implements ConfigProvider {
  get(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing config: ${key}`);
    return value;
  }
}
```

✅ **Separate config per environment**:
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production` (never committed)

❌ **We NEVER**:
- Hardcode config values in code
- Commit secrets to Git
- Bundle config with code
- Use different code for different environments

---

## IV. Backing Services

**PRINCIPLE**: Treat backing services as attached resources.

### Alle Implementation

✅ **Services as resources**:
- PostgreSQL database
- Redis cache
- Email service (SendGrid)
- Object storage (S3)

✅ **Swappable via config**:
```typescript
// Switch databases with env var
const dbUrl = config.get('DATABASE_URL');

// Production: PostgreSQL
// Development: In-memory
// Testing: Docker container
```

✅ **Adapter pattern** for all services:
```typescript
interface TaskRepository { /* ... */ }

// Swap implementations via container
class InMemoryTaskRepository implements TaskRepository
class PostgresTaskRepository implements TaskRepository
class MongoTaskRepository implements TaskRepository
```

❌ **We NEVER**:
- Hardcode service connections
- Distinguish between local and third-party services in code
- Make code changes to switch services

---

## V. Build, Release, Run

**PRINCIPLE**: Strictly separate build, release, and run stages.

### Alle Implementation

✅ **Build stage** (transform code into bundle):
```bash
# Build artifacts (no config)
bun run build

# Output: dist/ folder with compiled code
```

✅ **Release stage** (build + config = release):
```bash
# Combine build artifact with environment config
docker build -t alle:v1.2.3 .

# Tag with release version
git tag v1.2.3
```

✅ **Run stage** (execute release):
```bash
# Run specific release in environment
docker run -e NODE_ENV=production alle:v1.2.3
```

✅ **Unique release IDs**:
- Git SHA: `abc123`
- Semantic version: `v1.2.3`
- Timestamp: `2024-01-15T10:30:00Z`

❌ **We NEVER**:
- Make code changes in production
- Build code in production environment
- Mix build and runtime dependencies

---

## VI. Processes

**PRINCIPLE**: Execute the app as one or more stateless processes.

### Alle Implementation

✅ **Stateless processes**:
- No in-memory session storage
- No local file storage
- Each request can be handled by any instance

✅ **State stored externally**:
```typescript
// ❌ BAD - Stateful
class TaskService {
  private cache: Map<string, Task> = new Map();  // Lost on restart
}

// ✅ GOOD - Stateless
class TaskService {
  constructor(
    private repository: TaskRepository,  // External storage
    private cache: CacheAdapter         // Redis, not in-memory
  ) {}
}
```

✅ **Session data in backing services**:
- User sessions → Redis
- File uploads → S3
- Task data → PostgreSQL

❌ **We NEVER**:
- Store user data in process memory
- Rely on sticky sessions
- Use local filesystem for persistent data

---

## VII. Port Binding

**PRINCIPLE**: Export services via port binding.

### Alle Implementation

✅ **Self-contained HTTP server**:
```typescript
// Bun native server (not running in app server like Apache)
const server = Bun.serve({
  port: config.getNumber('PORT'),  // 4000
  fetch(req) {
    // Handle requests
  }
});
```

✅ **Port from environment**:
```bash
# Development
PORT=4000 bun run server

# Production (Cloud Run assigns port)
PORT=8080 bun run server
```

✅ **No external web server required**:
- No Apache, Nginx, IIS needed
- Application is complete HTTP server
- Direct port binding to OS

❌ **We NEVER**:
- Rely on external web server for routing
- Hardcode port numbers
- Require complex deployment configuration

---

## VIII. Concurrency

**PRINCIPLE**: Scale out via the process model.

### Alle Implementation

✅ **Horizontal scaling**:
```bash
# Run multiple instances
bun run server  # Process 1 on port 4000
bun run server  # Process 2 on port 4001
bun run server  # Process 3 on port 4002

# Load balancer distributes requests
```

✅ **Process types**:
- `web`: HTTP API server
- `worker`: Background job processor
- `scheduler`: Cron jobs

✅ **Stateless design enables scaling**:
- Add/remove processes without data loss
- No shared state between processes
- Load balancer handles distribution

❌ **We NEVER**:
- Daemonize or write PID files (OS handles this)
- Use threads for concurrency (use processes)
- Rely on single process for reliability

---

## IX. Disposability

**PRINCIPLE**: Maximize robustness with fast startup and graceful shutdown.

### Alle Implementation

✅ **Fast startup** (< 3 seconds):
```typescript
// Lazy initialization of resources
const server = Bun.serve({
  port: config.getNumber('PORT'),
  fetch(req) {
    // Initialize on first request if needed
    return handler(req);
  }
});

console.log('Server ready');  // Immediate
```

✅ **Graceful shutdown**:
```typescript
// Handle termination signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  // Stop accepting new requests
  server.stop();

  // Close database connections
  await db.close();

  // Exit cleanly
  process.exit(0);
});
```

✅ **Idempotent operations**:
```typescript
// Safe to retry on failure
async function createTask(input: CreateTaskInput): Promise<Task> {
  // Use unique constraint to prevent duplicates
  // Safe to retry if request times out
}
```

❌ **We NEVER**:
- Require long startup procedures
- Leave connections open on shutdown
- Design operations that can't be retried

---

## X. Dev/Prod Parity

**PRINCIPLE**: Keep development, staging, and production as similar as possible.

### Alle Implementation

✅ **Same backing services**:
- Development: PostgreSQL (Docker)
- Staging: PostgreSQL (Cloud)
- Production: PostgreSQL (Cloud)

❌ **NEVER** use different services:
- ~~Development: SQLite~~
- ~~Production: PostgreSQL~~

✅ **Same deployment**:
```bash
# Same Docker image for all environments
docker build -t alle:latest .

# Different config only
docker run -e NODE_ENV=development alle:latest
docker run -e NODE_ENV=production alle:latest
```

✅ **Continuous deployment**:
- Small time gap between code written and deployed
- Developers deploy their own code
- Fast iteration cycle

❌ **We NEVER**:
- Wait weeks between deployments
- Have different developers vs ops teams
- Use different tools in dev vs production

---

## XI. Logs

**PRINCIPLE**: Treat logs as event streams.

### Alle Implementation

✅ **Write to stdout/stderr**:
```typescript
// ✅ GOOD - Stream to stdout
console.log(JSON.stringify({
  level: 'info',
  message: 'Task created',
  taskId: task.id,
  timestamp: new Date().toISOString()
}));

// ❌ BAD - Write to file
fs.appendFileSync('app.log', message);
```

✅ **Structured logging**:
```typescript
logger.info('Task created', {
  taskId: task.id,
  userId: user.id,
  duration: performance.now() - start
});

// Output: {"level":"info","msg":"Task created","taskId":"abc",...}
```

✅ **Log aggregation** (in production):
- Development: Console output
- Staging: Cloud Logging (GCP)
- Production: Cloud Logging (GCP)
- Analysis: Log Explorer, dashboards

❌ **We NEVER**:
- Write to log files
- Manage log rotation
- Parse log files manually
- Store logs locally

---

## XII. Admin Processes

**PRINCIPLE**: Run admin/management tasks as one-off processes.

### Alle Implementation

✅ **One-off tasks** in same environment:
```bash
# Database migration
bun run migrate

# Data cleanup
bun run cleanup-old-tasks

# Generate report
bun run generate-report
```

✅ **Same codebase**:
```typescript
// scripts/migrate.ts
import { runMigrations } from '../packages/server/db/migrations';

await runMigrations();
```

✅ **Run in production environment**:
```bash
# Cloud Run job with production config
gcloud run jobs execute migrate \
  --region=us-central1 \
  --set-env-vars NODE_ENV=production
```

❌ **We NEVER**:
- Run admin tasks with different code
- SSH into servers to run scripts
- Use different config for admin tasks

---

## Compliance Checklist

Alle project compliance with 12-factor methodology:

- [x] **I. Codebase** — Single Git repo, multiple deploys
- [x] **II. Dependencies** — Declared in package.json, isolated with bun.lockb
- [x] **III. Config** — Environment variables, ConfigProvider abstraction
- [x] **IV. Backing Services** — Adapter pattern, swappable implementations
- [x] **V. Build, Release, Run** — Separate stages, versioned releases
- [x] **VI. Processes** — Stateless, no local storage
- [x] **VII. Port Binding** — Self-contained HTTP server
- [x] **VIII. Concurrency** — Horizontal scaling via process model
- [x] **IX. Disposability** — Fast startup, graceful shutdown
- [x] **X. Dev/Prod Parity** — Same services and tools everywhere
- [x] **XI. Logs** — Stdout/stderr streams, structured logging
- [x] **XII. Admin Processes** — One-off jobs in same environment

---

## Benefits Achieved

By following 12-factor principles, Alle achieves:

- **Portability**: Runs on any cloud platform (GCP, AWS, Azure)
- **Scalability**: Add instances without code changes
- **Resilience**: Processes can crash and restart safely
- **Consistency**: Dev environment matches production
- **Velocity**: Continuous deployment with confidence
- **Maintainability**: Clear separation of concerns

---

## Further Reading

- Official 12-Factor App: https://12factor.net/
- Beyond 12-Factor App: https://www.oreilly.com/library/view/beyond-the-twelve-factor/9781492042631/
- Cloud Native Patterns: https://www.manning.com/books/cloud-native-patterns
