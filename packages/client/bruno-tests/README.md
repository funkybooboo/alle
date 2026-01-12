# Bruno API Tests

This directory contains Bruno API tests for the Alle backend.

## Setup

Bruno CLI is already installed as a dev dependency. The collection is organized by feature area:

- **Tasks/** - Task CRUD operations and metadata
- **Tags/** - Tag management
- **Links/** - Task link operations
- **Attachments/** - File upload/download
- **Colors/** - Color preset management
- **Settings/** - Application settings
- **Trash/** - Trash operations

## Environments

Two environments are configured:

- **Local** - For running against local development server (http://localhost:8000)
- **Docker** - For running against Docker containerized services

## Running Tests

```bash
# Run all tests against local server
npm run test:api

# Run all tests against Docker environment
npm run test:api:docker

# Run specific folder
npx bru run bruno-tests/Tasks --env Local

# Run single test file
npx bru run bruno-tests/Tasks/create-task.bru --env Local
```

## Writing Tests

1. Create a new `.bru` file in the appropriate folder
2. Use the Bruno format:

```
meta {
  name: Test Name
  type: http
  seq: 1
}

post {
  url: {{graphqlEndpoint}}
  body: graphql
  auth: none
}

body:graphql {
  mutation {
    createTask(input: {
      title: "Test Task"
      date: "2024-01-01T00:00:00Z"
    }) {
      id
      title
      completed
    }
  }
}

assert {
  res.status: eq 200
  res.body.data.createTask.title: eq Test Task
}

tests {
  test("Task created successfully", function() {
    expect(res.body.data.createTask).to.have.property('id');
  });
}
```

## API Endpoints

The following endpoints are available:

- **GraphQL**: `{{graphqlEndpoint}}` - Main GraphQL API
- **Upload**: `{{uploadEndpoint}}` - File upload REST endpoint
- **WebSocket**: `{{wsEndpoint}}` - GraphQL subscriptions

## Test Organization

Tests should be organized by:
1. Feature area (folder)
2. Operation type (file name)
3. Test scenarios (within file)

Example structure:
```
Tasks/
  ├── create-task.bru
  ├── get-tasks.bru
  ├── update-task.bru
  ├── delete-task.bru
  └── task-with-metadata.bru
```

## Best Practices

1. Use descriptive test names
2. Test both success and error cases
3. Clean up test data when possible
4. Use variables for reusable values
5. Add assertions to verify responses
6. Document expected behavior in test descriptions
