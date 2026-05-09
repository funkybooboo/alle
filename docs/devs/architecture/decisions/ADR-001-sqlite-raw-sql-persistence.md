# ADR-001: SQLite with Raw SQL for Persistence

**Status**: Accepted  
**Date**: 2026-05-09  
**Context**: v0.7.0 — Persistence & Data I/O

## Context

Alle currently stores all data in-memory (`Map<string, T>` implementations). Data is lost on every server restart. The v0.7.0 milestone requires persistent storage. We need to choose a database technology and access pattern.

### Requirements

- Zero-config for self-hosted single-user deployment
- Survive server restarts
- Support all existing entities: Tasks, Projects, SomeDayGroups, RecurringTasks, UserPreferences
- Schema must evolve over time (migrations)
- Must support eventual migration to PostgreSQL for multi-user (v2.3.0)
- Must integrate cleanly with the existing Repository adapter pattern

### Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **SQLite + Raw SQL** | Zero-config, single file, bun:sqlite built-in, full control, no ORM abstraction leaks | More boilerplate, manual type mapping |
| **SQLite + Drizzle ORM** | Type-safe queries, auto-migrations, easy PG swap later | ORM overhead, abstraction leaks, query debugging harder |
| **SQLite + Prisma** | Mature schema DSL, auto-migrations | Rust engine binary, heavy, overkill for single-user |
| **PostgreSQL now** | Production-grade, multi-user ready | Requires separate process, config, not zero-config for self-hosted |
| **SQLite + Kysely** | Type-safe query builder, no full ORM | Another dependency, less mainstream than Drizzle |

## Decision

**Use SQLite with raw SQL via `bun:sqlite`.** No ORM.

### Rationale

1. **Zero-config deployment.** SQLite is a single `.db` file. Self-hosted users run one command, no database server to configure. `bun:sqlite` is built into Bun — zero dependencies.

2. **Full control.** Raw SQL means we know exactly what queries execute. No surprising N+1 queries from ORM lazy-loading. No abstraction leaks where the ORM can't express a query we need.

3. **Performance.** `bun:sqlite` is synchronous and extremely fast for single-user workloads. No async overhead, no connection pooling needed. SQLite handles writes sequentially — exactly right for our use case.

4. **Simplicity.** The Repository pattern already abstracts data access. Each repository receives raw rows and maps to domain types. This is straightforward, debuggable, and has no hidden magic.

5. **Migration path to PostgreSQL.** When v2.3.0 adds multi-user, we write a `PgTaskRepository` that implements the same `TaskRepository` interface. The Container swaps one line. Raw SQL repositories are easy to reason about and port — each query is explicit.

6. **ORMs add complexity we don't need yet.** Drizzle/Kysely solve problems we don't have (type-safe query composition, schema-auto-migrations). Our queries are simple CRUD + a few filter operations. Raw SQL is clearer for this.

### Implementation Details

**Database file**: Configurable via `DB_PATH` env var, defaults to `./data/alle.db`.

**Type mapping**:

| TypeScript type | SQLite column type | Notes |
|----------------|-------------------|-------|
| `string` | `TEXT` | Direct mapping |
| `number` | `INTEGER` | Direct mapping |
| `boolean` | `INTEGER` | 0/1 |
| `Date` / ISO strings | `TEXT` | ISO 8601 strings |
| `string[]` (tags) | `TEXT` | JSON-encoded array |
| Nested objects (reminder) | `TEXT` | JSON-encoded object |
| `null` / `undefined` | `NULL` | Nullable columns |

**Repository implementations**: `SqliteTaskRepository`, `SqliteProjectRepository`, `SqliteSomeDayGroupRepository`, `SqliteRecurringTaskRepository`, `SqliteUserPreferencesRepository` — each implements the existing interface, backed by raw SQL.

**Container wiring**: `STORAGE_ADAPTER` env var selects `memory` (default for tests) or `sqlite`.

**JSON columns**: Tags (`string[]`), reminder (`{ time, channels }`), and any nested objects are stored as JSON `TEXT` columns. The repository is responsible for `JSON.parse`/`JSON.stringify` at the boundary.

**Indexes**: Schema includes indexes on `tasks(date)`, `tasks(some_day_group_id)`, `tasks(parent_id)`, `tasks(recurring_task_id)`, `tasks(deleted_at)` — matching the existing query patterns in `TaskRepository`.

## Consequences

### Positive
- Zero-config self-hosted deployment (single `.db` file)
- Full query control and visibility
- No ORM dependency or version risk
- Straightforward Container swap for PostgreSQL later
- Synchronous API (bun:sqlite) simplifies repository code
- Easy to inspect database with any SQLite tool

### Negative
- More boilerplate per repository (SQL strings, type mapping functions)
- No compile-time query validation — errors caught at runtime
- Schema changes require manual migration files
- Type mapping between TypeScript and SQLite is manual (no generated types)

### Mitigations
- Contract tests: same test suite runs against both `InMemory` and `Sqlite` repositories — catches SQL bugs at test time
- Helper functions for common type mappings (`parseJsonColumn`, `toBoolean`, `toIsoString`) reduce boilerplate
- Raw SQL migrations are version-controlled and reviewed — see ADR-003
- PostgreSQL repositories will have their own set of raw SQL queries, tested the same way