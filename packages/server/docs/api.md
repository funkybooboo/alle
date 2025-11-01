# API Documentation

GraphQL-only API server running on `http://localhost:8000/graphql`.

## Quick Links

| Interface | URL | Purpose |
|-----------|-----|---------|
| **GraphQL Playground** | http://localhost:8000/graphql | Interactive GraphQL IDE |
| **GraphQL Endpoint** | POST http://localhost:8000/graphql | API endpoint |

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

### Examples

Create a task:
```graphql
mutation {
  createTask(input: { title: "Buy groceries" }) {
    id
    title
    completed
  }
}
```

Query all tasks:
```graphql
query {
  tasks {
    id
    title
    completed
    createdAt
  }
}
```

Query specific task:
```graphql
query {
  task(id: 1) {
    id
    title
    completed
  }
}
```

Update a task:
```graphql
mutation {
  updateTask(id: 1, input: { completed: true }) {
    id
    title
    completed
  }
}
```

Delete a task:
```graphql
mutation {
  deleteTask(id: 1)
}
```

### Using curl

Query:
```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ tasks { id title completed } }"}'
```

Mutation:
```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { createTask(input: { title: \"New Task\" }) { id title } }"}'
```

### Response Format

Success:
```json
{
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "Buy groceries",
        "completed": false
      }
    ]
  }
}
```

Error:
```json
{
  "errors": [
    {
      "message": "Database error: ...",
      "locations": [{"line": 2, "column": 3}],
      "path": ["tasks"]
    }
  ]
}
```

## GraphQL Playground

Visit `http://localhost:8000/graphql` in your browser for:
- Interactive query builder
- Auto-completion
- Built-in documentation
- Schema exploration
- Query validation

The playground provides the best development experience with full schema introspection.
