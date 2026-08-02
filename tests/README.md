# Tests

Alle has three layers of automated tests:

## 1. Unit tests (`bun run test:unit`)

Fast, isolated tests of pure logic and adapters — no network, no browser.
Run with Bun's built-in test runner. 167 tests across the three packages:

- `packages/shared` — date provider, HTTP client, errors, task types
- `packages/server` — in-memory repositories, services, middleware, utils
- `packages/client` — DI container, filters, notification store

## 2. API integration tests (`bun run test:e2e:api`)

Black-box HTTP tests against the live Bun server (port 4000), driven by
Playwright's `APIRequestContext`. They exercise the real HTTP stack — routing,
validation (Zod), guards (rate limit), middleware (security headers), error
mapping, and content negotiation — end to end.

Location: `tests/api-tests/` · Config: `playwright.config.ts` (project `api`).

Covers, per resource:

- **tasks** — create/list/get/update/delete, validation (text length, time
  format), filtering by date/tag/someday/completion, soft-delete + trash +
  restore + purge, parent/child completion roll-up, plain-text content
  negotiation.
- **projects** — CRUD, auto-generated tag, activate/deactivate, validation.
- **recurring-tasks** — CRUD, generate-instances (daily/interval), validation
  (frequency enum, ISO date, interval/dayOfWeek bounds), 404 paths.
- **someday-groups** — CRUD, validation (name/tag/position bounds).
- **tags** — list (sorted, de-duped), info (counts), rename, merge (incl.
  no-duplicate target), validation, content negotiation.
- **user preferences** — GET defaults, PATCH single-field/nested, validation
  (theme/width enums/bounds), content negotiation.
- **meta** — root, health, 404+CORS, OPTIONS preflight, security headers,
  OpenAPI JSON + YAML.

Each test cleans up the entities it creates via `afterEach` so the shared
in-memory server stays tidy.

## 3. End-to-end browser tests (`bun run test:e2e:ui`)

Playwright browser tests against the live SvelteKit client (port 3000) + server
(port 4000), using the system Chromium at `/usr/bin/chromium` (no
`playwright install` needed). Tests wait for SvelteKit hydration before
interacting (see `tests/e2e/util.ts` `hydrated()`).

Location: `tests/e2e/` · Config: `playwright.config.ts` (project `e2e`).

Covers:

- **app shell** — title/landmark, icon-rail (all 9 items), today section,
  bottom bar (clock + task count), modal open/close + keyboard shortcuts
  (`/`, `?`, `n`), modal switching.
- **task CRUD** — create via inline input, complete via checkbox, inline edit,
  delete + Undo notification + restore, detail-modal tag editing.
- **modals** — Settings theme change (document `data-theme` + server
  persistence), timezone/time-format controls, Search (filter + hint/empty),
  Trash (list deleted, restore).

## Running everything

```sh
bun run test:unit          # unit only (fast)
bun run test:e2e:api       # API integration only
bun run test:e2e:ui        # browser E2E only
bun run test:e2e           # both API + browser ( sequential)
bun run test:all           # unit + e2e in parallel
```

The Playwright config auto-starts the server and client dev servers and reuses
already-running ones locally (`reuseExistingServer`), so tests are fast to
re-run. In CI it starts fresh instances.

## Notes

- API/E2E tests target the **server directly** (`http://localhost:4000`) for
  seeding/cleanup, even in the browser project, so they are independent of the
  client's CORS/proxy behavior.
- The `tests/api/` Bruno collection (`.bru` files) is a separate, manual API
  exerciser (run via `bun run test:api`); the Playwright `tests/api-tests/`
  suite is the automated, asserted version of the same surface.