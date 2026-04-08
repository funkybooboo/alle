# Server

This is the Bun REST API server for the Alle application. It runs on port 4000 and serves the full task management API.

## Quick Start

```bash
mise run server
```

The server will be available at `http://localhost:4000`.

## API Overview

| Resource | Endpoints |
|----------|-----------|
| Tasks | `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/:id` |
| Projects | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`, `POST /api/projects/:id/activate`, `POST /api/projects/:id/deactivate` |
| Recurring Tasks | `GET/POST /api/recurring-tasks`, `GET/PUT/DELETE /api/recurring-tasks/:id`, `POST /api/recurring-tasks/:id/generate` |
| Someday Groups | `GET/POST /api/someday-groups`, `GET/PUT/DELETE /api/someday-groups/:id` |
| Tags | `GET /api/tags`, `POST /api/tags/rename`, `POST /api/tags/merge` |
| Preferences | `GET /api/preferences`, `PATCH /api/preferences` |
| Health | `GET /api/health` |

The full OpenAPI 3.1 spec is served at `http://localhost:4000/openapi.yaml` (or `/openapi.json`).

## Learn More

See [Architecture](../../docs/devs/architecture/architecture.md) for how the server fits into the broader system.
