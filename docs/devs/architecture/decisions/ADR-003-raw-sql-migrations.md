# ADR-003: Raw SQL Migration Files

**Status**: Accepted  
**Date**: 2026-05-09  
**Context**: v0.7.0 — Persistence & Data I/O

## Context

With SQLite as our persistence layer (ADR-001), we need a strategy for evolving the database schema over time. Schema changes are inevitable — new columns, new tables, index changes, data migrations.

### Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Raw SQL migration files** | Full control, reviewable in PRs, no tooling dependency, explicit | Manual to write, no type safety |
| **Drizzle Kit migrations** | Auto-generated from schema, type-safe | ORM coupling (rejected in ADR-001), generated code is black-box |
| **Prisma migrations** | Mature, auto-diff, deployment commands | Requires Prisma engine, ORM coupling |
| **Flyway-style (Java world)** | Well-known pattern, versioned | Over-engineered for our needs |
| **No migrations, create on startup** | Simplest | No schema evolution, destructive on change |

## Decision

**Use sequentially-numbered raw SQL migration files** with a lightweight migration runner.

### Rationale

1. **Explicit and reviewable.** Every schema change is a plain SQL file that gets code-reviewed. No magic, no generated diffs, no surprises. What you see is exactly what runs.

2. **No ORM coupling.** Consistent with ADR-001's decision to use raw SQL. Migrations are plain SQL — no schema definition file, no DSL, no generated code.

3. **Database-agnostic structure.** While migration SQL is database-specific (SQLite vs PostgreSQL), the migration runner and versioning scheme are the same. When we add PostgreSQL, we'll have `migrations/sqlite/` and `migrations/postgresql/` directories. The runner is the same; the SQL changes.

4. **Testability.** Migrations run in tests. Contract tests verify the schema matches what repositories expect. If a migration breaks something, tests catch it immediately.

5. **Simplicity.** The migration runner is ~50 lines of TypeScript. No external dependencies. No CLI tool to install. It just works.

### Migration File Structure

```
packages/server/src/adapters/data/migrations/
├── 001_initial_schema.sql
├── 002_add_reminder_to_tasks.sql
├── 003_add_streak_tracking.sql
└── ...
```

**Naming convention**: `{sequence}_{descriptive_name}.sql`  
- Sequence: 3-digit zero-padded number
- Name: lowercase, snake_case, describes the change

### Migration File Format

Each migration file is a plain SQL file. No up/down split — migrations are **forward-only**.

```sql
-- 001_initial_schema.sql
-- Creates the initial database schema for Alle

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    notes TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    date TEXT,                          -- ISO date string, NULL means Someday
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',    -- JSON array of strings
    parent_id TEXT,                     -- FK to tasks(id) for sub-tasks
    rollover_enabled INTEGER NOT NULL DEFAULT 1,
    some_day_group_id TEXT,             -- FK to some_day_groups(id)
    position INTEGER,
    state TEXT,                         -- 'ready', 'scheduled', 'done', NULL
    recurring_task_id TEXT,             -- FK to recurring_tasks(id)
    instance_date TEXT,
    original_scheduled_date TEXT,
    days_late INTEGER DEFAULT 0,
    depends_on TEXT,
    start_time TEXT,                    -- ISO 8601 time string
    end_time TEXT,                      -- ISO 8601 time string
    reminder TEXT,                      -- JSON: { time, channels }
    deleted_at TEXT                     -- ISO timestamp, NULL = not deleted
);

CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_some_day_group_id ON tasks(some_day_group_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_tasks_recurring_task_id ON tasks(recurring_task_id);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT NOT NULL UNIQUE,
    description TEXT,
    start_date TEXT,
    due_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    completed_at TEXT
);

CREATE TABLE some_day_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    tag TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE recurring_tasks (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    notes TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    frequency TEXT NOT NULL,            -- 'daily', 'weekly', 'monthly', 'yearly'
    interval INTEGER NOT NULL DEFAULT 1,
    day_of_week INTEGER,
    day_of_month INTEGER,
    start_date TEXT NOT NULL,
    end_date TEXT,
    rollover_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE user_preferences (
    id TEXT PRIMARY KEY DEFAULT 'default',
    theme TEXT NOT NULL DEFAULT 'system',
    locale TEXT NOT NULL DEFAULT 'en',
    some_day_panel_width INTEGER NOT NULL DEFAULT 300,
    some_day_panel_collapsed INTEGER NOT NULL DEFAULT 0,
    some_day_panel_last_open_width INTEGER,
    rollover_enabled INTEGER NOT NULL DEFAULT 1,
    show_empty_days INTEGER NOT NULL DEFAULT 1,
    delete_confirmation TEXT NOT NULL DEFAULT 'instant',
    collapsed_sections TEXT NOT NULL DEFAULT '[]',
    active_filters TEXT NOT NULL DEFAULT '{}',
    tag_kinds TEXT NOT NULL DEFAULT '[]',
    tag_kind_map TEXT NOT NULL DEFAULT '{}',
    notification_position TEXT NOT NULL DEFAULT 'bottom-right',
    updated_at TEXT NOT NULL
);

-- Tracking table (created first by migration runner)
-- See "Migration Runner" section below
```

### Forward-Only Migrations

Migrations never have a "down" direction. Reasoning:

1. **Production databases only go forward.** In practice, you never roll back a production schema. If something breaks, you write a new migration that fixes it.

2. **Development databases are disposable.** During development, `rm data/alle.db` and re-run all migrations. This is fast (SQLite creates from scratch in milliseconds).

3. **Simpler mental model.** No "what does down look like?" decisions. Each migration is one directional change.

4. **Data migrations are one-way.** Once you've transformed data (e.g., splitting a `name` column into `first_name` + `last_name`), the reverse transformation is lossy or impossible.

### Migration Runner

A lightweight TypeScript module that:

1. Creates a `_migrations` tracking table if it doesn't exist
2. Reads all `.sql` files from the migrations directory, ordered by sequence number
3. Compares against applied migrations in `_migrations` table
4. Runs each unapplied migration in a transaction
5. Records the migration as applied

```typescript
interface MigrationRunner {
    run(db: Database, migrationsDir: string): Promise<void>;
}

// _migrations table:
// CREATE TABLE IF NOT EXISTS _migrations (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL UNIQUE,
//     applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
// );
```

**Transaction safety**: Each migration runs in a transaction. If a migration fails, the transaction rolls back and the server refuses to start. This prevents partial schema states.

**Startup behavior**: The migration runner runs on server start, before any repository is initialized. If there are unapplied migrations, they run automatically. If a migration fails, the server logs the error and exits.

### Development Workflow

```bash
# Create a new migration
touch packages/server/src/adapters/data/migrations/004_add_column_x.sql

# Write the SQL
vim packages/server/src/adapters/data/migrations/004_add_column_x.sql

# Test: delete the dev database and restart the server
rm data/alle.db
bun run dev   # migrations run automatically

# Or: run contract tests that exercise both in-memory and sqlite repos
bun test
```

### Contract Tests

The existing unit tests for `InMemoryXRepository` serve as contract tests. When `SqliteXRepository` is implemented, the same test suite runs against it:

```typescript
// Example: shared contract test for TaskRepository
describe('TaskRepository contract', () => {
    // Run for both InMemoryTaskRepository and SqliteTaskRepository
    function runContractTests(createRepo: () => TaskRepository) {
        it('creates and finds a task', async () => { ... });
        it('finds tasks by date', async () => { ... });
        // ...
    }

    describe('InMemory', () => runContractTests(() => new InMemoryTaskRepository(dateProvider)));
    describe('Sqlite', () => runContractTests(() => new SqliteTaskRepository(db)));
});
```

### PostgreSQL Migration Path

When PostgreSQL is added (v2.3.0):

1. The migration runner stays the same (interface-based)
2. A `PgMigrationRunner` is created that reads from `migrations/postgresql/`
3. PostgreSQL migration files are written in PostgreSQL-flavored SQL
4. Both SQLite and PostgreSQL migrations exist in parallel
5. The Container selects the appropriate migration runner based on `STORAGE_ADAPTER`

## Consequences

### Positive
- Every schema change is explicit, reviewable, and version-controlled
- No external tooling dependency (no Drizzle Kit, no Prisma CLI)
- Forward-only model is simple and matches real-world production practices
- Migration runner is ~50 lines of TypeScript
- Database-agnostic structure: same runner, different SQL files per database
- Contract tests ensure InMemory and Sqlite repositories behave identically

### Negative
- Manual SQL writing — no type safety, no autocomplete
- No automatic "diff this schema vs that schema" tooling
- Forward-only means no rollback — must write fix-forward migrations
- Two sets of migration files when PostgreSQL is added (SQLite + PG)

### Mitigations
- Contract tests catch most mistakes
- `rm data/alle.db` during development is instant — no need for rollback
- Fix-forward is industry best practice (Facebook, Instagram, GitHub all use it)
- PostgreSQL migration files will share structure with SQLite files — many will differ only in syntax (`INTEGER` vs `BOOLEAN`, `TEXT` vs `JSONB`, etc.)