# ADR-002: SQLite-Backed Job Queue for Background Processing

**Status**: Accepted  
**Date**: 2026-05-09  
**Context**: v0.8.0 — Automation & beyond

## Context

Alle needs background processing for:
- **Task rollover** (v0.8.0): Move incomplete tasks to the next day at a configured time
- **Recurring task generation** (v0.8.0): Create task instances from templates
- **Trash purge** (ongoing): Permanently delete tasks past the retention period
- **Reminders** (v2.2.0): Schedule and dispatch push/email notifications

All of these require: scheduling work for the future, retrying on failure, and surviving server restarts.

### Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **SQLite-backed job queue** | Reuses existing SQLite, no new deps, jobs survive restarts, consistent with adapter pattern | Polling-based, not event-driven; SQLite write contention if queue is busy |
| **In-process scheduler (setInterval)** | Simplest possible, no new tables | Jobs lost on crash, no retry, no persistence, no visibility |
| **Redis + BullMQ** | Battle-tested, rich scheduling, pub/sub | Redis dependency overkill for single-user; new infra burden |
| **pg-boss (PostgreSQL)** | Good for later, persistent jobs | Requires PG now; premature for single-user phase |
| **Bun worker threads** | Parallel execution | Doesn't solve scheduling or persistence; adds lifecycle complexity |

## Decision

**Use a SQLite-backed job queue** with an in-process worker that polls for pending jobs.

### Rationale

1. **Reuses existing infrastructure.** We're already shipping SQLite for persistence (ADR-001). The job queue is another table in the same database. No new process, no new dependency, no new failure mode.

2. **Jobs survive restarts.** A job written to the `jobs` table before a crash will be picked up on next server start. This is critical for rollover and recurring task generation — losing those means tasks don't appear.

3. **Consistent architecture.** The `JobQueue` is defined as an interface (adapter pattern), with `SqliteJobQueue` as the implementation. When PostgreSQL arrives, `PgJobQueue` swaps in with one Container line change, same as the repositories.

4. **Polling is fine for single-user.** We're not processing thousands of jobs per second. A 1-second poll interval (configurable) is imperceptible for task rollover and recurring generation. If we need lower latency later (notifications), we can add WebSocket-triggered immediate processing alongside the poll.

5. **SQLite write contention is minimal.** Single-user workload: maybe 1-2 writes per second maximum during active use. The job queue adds maybe 1 write per job execution. SQLite handles this trivially (its write concurrency limit is ~50 writes/sec on consumer hardware).

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Container                        │
│                                                      │
│  jobQueue ──────────► JobQueue (interface)           │
│                          │                            │
│                    SqliteJobQueue                     │
│                          │                            │
│                       SQLite DB                      │
│                  (jobs table + data tables)           │
│                                                      │
│  jobRunner ─────────► JobRunner (service)            │
│                          │                            │
│                    polls JobQueue                     │
│                    processes jobs                     │
│                    calls JobHandlers                  │
└─────────────────────────────────────────────────────┘
```

### Job Table Schema

```sql
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,              -- 'rollover', 'generate-recurring', 'purge-deleted', 'send-reminder'
    payload TEXT NOT NULL,            -- JSON-encoded job-specific data
    status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'running', 'completed', 'failed', 'dead'
    scheduled_at TEXT NOT NULL,        -- ISO 8601 timestamp
    started_at TEXT,                  -- ISO 8601, set when job starts
    completed_at TEXT,                -- ISO 8601, set when job completes
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_error TEXT,                  -- Error message from last failed attempt
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_jobs_status_scheduled ON jobs(status, scheduled_at);
```

### Job Queue Interface

```typescript
interface JobQueue {
    schedule(type: string, payload: unknown, scheduledAt: Date): Promise<string>;
    cancel(jobId: string): Promise<void>;
    getPending(): Promise<Job[]>;
    markRunning(jobId: string): Promise<void>;
    markCompleted(jobId: string): Promise<void>;
    markFailed(jobId: string, error: string): Promise<void>;
    markDead(jobId: string, error: string): Promise<void>;
}

interface Job {
    id: string;
    type: string;
    payload: unknown;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'dead';
    scheduledAt: string;
    startedAt: string | null;
    completedAt: string | null;
    attempts: number;
    maxAttempts: number;
    lastError: string | null;
    createdAt: string;
    updatedAt: string;
}
```

### Job Runner

```typescript
class JobRunner {
    private handlers: Map<string, JobHandler> = new Map();
    private pollInterval: NodeJS.Timer | null = null;
    
    constructor(
        private jobQueue: JobQueue,
        private config: JobRunnerConfig
    ) {}
    
    register(type: string, handler: JobHandler): void;
    start(): void;    // begins polling
    stop(): void;     // stops polling, waits for current job
    
    // Polls every config.pollIntervalMs (default: 1000)
    // For each pending job where scheduledAt <= now:
    //   1. markRunning(id)
    //   2. call handler(job)
    //   3. on success: markCompleted(id)
    //   4. on failure: increment attempts; if >= maxAttempts: markDead(id), else: markFailed(id)
}

interface JobHandler {
    handle(job: Job): Promise<void>;
}

interface JobRunnerConfig {
    pollIntervalMs: number;    // default: 1000
    maxAttempts: number;       // default: 3
    concurrency: number;       // default: 1 (sequential for single-user)
}
```

### Job Types

| Type | Payload | Schedule | Description |
|------|---------|----------|-------------|
| `rollover` | `{ date: string }` | Configured time (midnight or 9am) | Move incomplete tasks to next day |
| `generate-recurring` | `{ dateRange: { from: string, to: string } }` | Daily, generates 1-2 weeks ahead | Create recurring task instances |
| `purge-deleted` | `{ maxAgeDays: number }` | Daily at 3am | Permanently delete old soft-deleted tasks |
| `send-reminder` | `{ taskId: string, channels: string[], time: string }` | At reminder time | Dispatch push/email notification |

### Retry Strategy

- **Max attempts**: 3 (configurable per job type)
- **Exponential backoff**: Next retry scheduled at `now + (2^attempts * baseDelay)` where baseDelay = 5 seconds
- **Dead letter**: After max attempts, job status becomes `dead`. No automatic retries. Admin API endpoint (future) to view and retry dead jobs.
- **Timeout**: Each job handler has a configurable timeout (default: 30 seconds). Jobs exceeding timeout are marked failed.

### Startup Behavior

On server start, the `JobRunner`:
1. Claims any `running` jobs (from previous crashed server) and resets them to `pending`
2. Schedules recurring jobs if they're not already scheduled (e.g., daily rollover)
3. Starts the poll loop

This ensures no work is lost after a crash.

## Consequences

### Positive
- Jobs survive server restarts (written to SQLite before processing)
- Retry with exponential backoff for transient failures
- Consistent with adapter pattern — easy swap to PostgreSQL later
- No new infrastructure dependencies
- Observable: `jobs` table can be queried for status, errors, history
- Simple concurrency model (single worker) matches single-user workload

### Negative
- Polling introduces a small latency (1 second default) between job scheduling and execution
- Single worker means jobs run sequentially — fine for single-user, needs redesign for multi-user
- No priority queue — all pending jobs processed in scheduled_at order

### Mitigations
- For latency-sensitive jobs (notifications), the service that creates the job can also immediately trigger a poll cycle
- Multi-user PostgreSQL redesign is a v2.3.0 concern — the interface isolation means we only rewrite the implementation, not the service layer
- Priority can be added later with a `priority INTEGER` column and `ORDER BY priority, scheduled_at`