# @alle/shared

Shared code used by both the `client` and `server` packages. Nothing in here should be environment-specific — it must run in both Bun and the browser.

## Contents

| Path | What's in it |
|------|-------------|
| `src/types/` | Core data models: `Task`, `Project`, `RecurringTask`, `SomeDayGroup`, `UserPreferences`, `ApiResponse` |
| `src/adapters/` | Adapter interfaces (ports) and universal implementations: `HttpClient`, `Logger`, `DateProvider`, `ConfigProvider` |
| `src/errors/` | `AppError` base class and typed error subclasses (`ValidationError`, `NotFoundError`, etc.) |
| `src/constants.ts` | API route paths and shared validation rules |

## The Golden Rule

If the client needs it **and** the server needs it → put it here.  
If only the server needs it → `packages/server`.  
If only the client needs it → `packages/client`.

## Learn More

See [Architecture](../../docs/devs/architecture/architecture.md) for how the shared package fits into the broader system.
