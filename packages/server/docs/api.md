# API Documentation

Server runs on `http://localhost:8000` with both REST and GraphQL APIs.

## Quick Links

| Interface | URL | Purpose |
|-----------|-----|---------|
| **Swagger UI** | http://localhost:8000/swagger-ui/ | Interactive REST API docs + testing |
| **GraphQL Playground** | http://localhost:8000/graphql | Interactive GraphQL IDE |
| **OpenAPI JSON** | http://localhost:8000/api-docs/openapi.json | Auto-generated spec |
| **OpenAPI YAML** | `docs/openapi.yaml` | Static spec file |

## GraphQL API

**Endpoint:** `POST /graphql` | **Playground:** `GET /graphql`

### Schema Overview

```graphql
# Queries
tasks: [Task!]!              # Get all tasks
task(id: Int!): Task         # Get task by ID
incompleteTasks: [Task!]!    # Get incomplete tasks

# Mutations
createTask(input: CreateTaskInput!): Task!
updateTask(id: Int!, input: UpdateTaskInput!): Task!
deleteTask(id: Int!): Boolean!

# Types
type Task {
  id: Int!
  title: String!
  completed: Boolean!
  createdAt: String!
  updatedAt: String!
}

input CreateTaskInput {
  title: String!
}

input UpdateTaskInput {
  title: String
  completed: Boolean
}
```

### Quick Examples

```graphql
# Create
mutation { createTask(input: { title: "New Task" }) { id title } }

# Get all
query { tasks { id title completed } }

# Update
mutation { updateTask(id: 1, input: { completed: true }) { id title } }

# Delete
mutation { deleteTask(id: 1) }
```

**Tip:** Use the GraphQL Playground at `/graphql` for autocomplete and docs.

## REST API

**Use Swagger UI at `/swagger-ui/` for full interactive documentation.**

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tasks` | List all tasks |
| `GET` | `/api/tasks/incomplete` | List incomplete tasks |
| `GET` | `/api/tasks/:id` | Get task by ID |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |

### Quick Examples

```bash
# Create
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task"}'

# Get all
curl http://localhost:8000/api/tasks

# Update
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete
curl -X DELETE http://localhost:8000/api/tasks/1
```

### Response Format

**Success:**
```json
{
  "id": 1,
  "title": "Task title",
  "completed": false,
  "created_at": "2025-10-24 00:00:00.000000000 UTC",
  "updated_at": "2025-10-24 00:00:00.000000000 UTC"
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success (GET/PUT) |
| `201` | Created (POST) |
| `204` | No Content (DELETE) |
| `400` | Bad Request |
| `404` | Not Found |
| `500` | Server Error |
