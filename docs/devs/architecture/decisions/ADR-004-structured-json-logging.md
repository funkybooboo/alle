# ADR-004: Structured JSON Logging & Request Tracing

**Status**: Accepted  
**Date**: 2026-05-09  
**Context**: v0.7.0 — Persistence & Data I/O (infrastructure foundation)

## Context

Alle's current `ConsoleLogger` outputs human-readable text lines like:

```
[2026-05-09T12:00:00.000Z] [INFO] Task created {"taskId":"abc"}
```

This format is unreadable by log aggregation tools (Loki, Elasticsearch, Graylog). It lacks:
- Structured fields for filtering and grouping
- Request correlation (linking all logs from one HTTP request)
- Request duration tracking
- Consistent schema for automated parsing

The roadmap calls for background job processing (v0.8.0), SQLite persistence (v0.7.0), and eventually multi-user SaaS (v2.3.0+). All of these produce logs that need to be searchable, filterable, and correlated.

### Requirements

- Logs must be machine-parseable (JSON) in production
- Logs must be human-readable (text) in development
- All logs from a single HTTP request must be correlated by a request ID
- Every HTTP request must log method, path, status code, and duration
- The existing `Logger` interface must remain stable (swap implementation, not interface)
- OpenTelemetry SDK adoption is deferred to v2.x (see rationale below)

### Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **JSON logging with LOG_FORMAT env var** | Simple, no new deps, works with any log collector, human-readable in dev | Manual structured logging discipline required |
| **OpenTelemetry SDK now** | Standards-based, traces + metrics + logs unified | Heavy SDK, overkill for single-user phase, breaks if Bun's OTEL support is immature |
| **Pino (Node.js logger)** | Fast, structured, widely used | New dependency, more than we need |
| **Winston** | Feature-rich, transports | Heavy, callback-based, over-engineered for our needs |

## Decision

**Upgrade `ConsoleLogger` to emit structured JSON when `LOG_FORMAT=json` (production default) and human-readable text when `LOG_FORMAT=text` (development default).** Add request ID middleware. Defer OpenTelemetry to v2.x.

### JSON Log Format

Every log line is a single JSON object when `LOG_FORMAT=json`:

```json
{
  "timestamp": "2026-05-09T12:34:56.789Z",
  "level": "info",
  "message": "Task created",
  "context": {
    "taskId": "abc123",
    "requestId": "req_456def"
  }
}
```

**Required fields**:

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 with milliseconds |
| `level` | string | `debug`, `info`, `warn`, `error` |
| `message` | string | Human-readable log message |
| `context` | object | Optional structured metadata |

**Reserved context keys** (not printed in text mode, always present in JSON mode):

| Key | When present | Description |
|-----|-------------|-------------|
| `requestId` | HTTP request scope | UUID correlating all logs from one request |
| `method` | Request logs | HTTP method (GET, POST, etc.) |
| `path` | Request logs | URL path |
| `statusCode` | Request logs | HTTP response status code |
| `durationMs` | Request logs | Request duration in milliseconds |
| `jobId` | Background job scope | Job ID correlating all logs from one job execution |
| `jobType` | Background job scope | Job type (rollover, generate-recurring, etc.) |

### Text Log Format (Development)

When `LOG_FORMAT=text`:

```
[2026-05-09T12:34:56.789Z] [INFO] [req_456def] POST /api/tasks 201 12ms — Task created
[2026-05-09T12:34:56.890Z] [DEBUG] [req_456def] Database query completed {"table":"tasks","durationMs":3}
[2026-05-09T12:34:57.000Z] [ERROR] Background job failed {"jobId":"job_789","jobType":"rollover","error":"Connection timeout"}
```

Text format includes request/job IDs inline for easy dev scanning. JSON format puts them in the context object for machine filtering.

### Request ID Middleware

A new guard/middleware that:
1. Generates a UUID (`crypto.randomUUID()`) for each incoming HTTP request
2. Stores it in a `requestId` variable passed through the request handler chain
3. Includes it in every `LogContext` for that request's scope
4. Returns it as an `X-Request-Id` response header
5. Accepts an incoming `X-Request-Id` header if present (for distributed tracing in v2.x)

**Implementation approach**: The request ID is attached to the `HttpRequest` object and passed to services via the existing container. Services receive a `LogContext` with `requestId` pre-filled. No async local storage — explicit context passing keeps dependencies visible.

### Request Duration Logging

Every HTTP request logs a completion line:

```
[JSON] {"timestamp":"...","level":"info","message":"Request completed","context":{"requestId":"req_456","method":"POST","path":"/api/tasks","statusCode":201,"durationMs":12}}
[Text] [2026-05-09T12:34:56Z] [INFO] [req_456] POST /api/tasks 201 12ms
```

This is logged by the server after the route handler completes and middleware runs. Duration measured from request receipt to response delivery.

### Logger Interface

The `Logger` interface in `packages/shared` stays the same:

```typescript
interface Logger {
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error | unknown, context?: LogContext): void;
}
```

No changes. `ConsoleLogger` implementation changes to support JSON output. This is the key architectural point — the interface is stable, the implementation evolves.

### Child Logger Pattern

Services that need request-scoped logging use a child logger pattern:

```typescript
class RequestLogger implements Logger {
    constructor(private parent: Logger, private defaultContext: LogContext) {}
    
    debug(message: string, context?: LogContext): void {
        this.parent.debug(message, { ...this.defaultContext, ...context });
    }
    // ... same for info, warn, error
}
```

Route handlers create a child logger with `requestId` baked in, then pass it to services. Services don't need to know about request IDs — they just log with their child logger.

### Job Logging

Background jobs use the same child logger pattern with `jobId` and `jobType` as default context:

```typescript
const jobLogger = new RequestLogger(container.logger, { jobId: job.id, jobType: job.type });
// All logs from this job include jobId and jobType automatically
```

### Error Logging

Error logs always include the error message and stack trace:

```typescript
logger.error('Task creation failed', error, { taskId: input.text, requestId });
```

In JSON mode:

```json
{
  "timestamp": "2026-05-09T12:34:56Z",
  "level": "error",
  "message": "Task creation failed",
  "context": {
    "taskId": "abc",
    "requestId": "req_456",
    "error": "SQLITE_CONSTRAINT: UNIQUE constraint failed",
    "stack": "Error: SQLITE_CONSTRAINT...\n    at SqliteTaskRepository.create..."
  }
}
```

In text mode:

```
[2026-05-09T12:34:56Z] [ERROR] [req_456] Task creation failed: SQLITE_CONSTRAINT: UNIQUE constraint failed
    at SqliteTaskRepository.create...
    at TaskService.create(...)
```

### Configuration

| Env Var | Default | Description |
|--------|---------|-------------|
| `LOG_FORMAT` | `text` in dev, `json` in prod | Log output format |
| `LOG_LEVEL` | `debug` in dev, `info` in prod | Minimum log level |

`NODE_ENV=development` → `LOG_FORMAT=text`, `LOG_LEVEL=debug`  
`NODE_ENV=production` → `LOG_FORMAT=json`, `LOG_LEVEL=info`

Explicit env vars override the defaults.

### OpenTelemetry Deference Rationale

OTEL SDK adoption is deferred to v2.x because:

1. **Single-process, single-user.** Distributed tracing adds no value when there's one process. Request IDs give us correlation without OTEL overhead.

2. **Bun OTEL maturity.** The OTEL SDK for Bun is not yet as mature as Node.js. Adding it now risks instability.

3. **Interface stability.** Our `Logger` interface is OTEL-compatible. When we add OTEL, we create an `OtelLogger` that wraps the OTEL SDK and implements `Logger`. The interface doesn't change.

4. **Metrics are separate.** ADR-005 defines a `MetricsAdapter` interface. OTEL metrics can be added as an implementation later without changing the interface.

5. **Migration path.** v2.x adds OTEL as a new adapter implementation. Zero breaking changes to services or routes.

## Consequences

### Positive
- Logs are machine-parseable in production — works with Loki, Elasticsearch, any JSON log collector
- Request IDs correlate all logs from a single HTTP request
- Request duration is logged for every request — gives basic performance visibility
- `Logger` interface unchanged — zero service-level refactoring
- Child logger pattern keeps context passing explicit and testable
- Text mode keeps development ergonomics good

### Negative
- Developers must remember to include context objects in log calls
- JSON logs are harder to read in raw `docker logs` — mitigated by `LOG_FORMAT=text` in dev and log aggregation tools in prod
- No distributed tracing yet — single-process only until v2.x

### Mitigations
- Code review enforces structured logging discipline (no bare `logger.info('did something')` without context)
- `docker logs` with `--format` or `jq` for local JSON inspection
- Child logger pattern reduces boilerplate — context is set once, not repeated per log call