# Alle API Tests (Bruno)

This directory contains API tests for the Alle todo application using [Bruno](https://www.usebruno.com/), an open-source API testing tool.

## Why Bruno?

- **Git-friendly**: Tests are stored as plain text files (`.bru` format)
- **No cloud account required**: Everything runs locally
- **Fast**: Written in JavaScript, runs directly on Node.js
- **Privacy-first**: No data leaves your machine

## Installation

Install Bruno:

```bash
# macOS
brew install bruno

# Linux (snap)
sudo snap install bruno

# Or download from: https://www.usebruno.com/downloads
```

## Running Tests

### Via Bruno GUI

1. Open Bruno app
2. Click "Open Collection"
3. Select the `bruno` directory
4. Select the "local" environment
5. Run individual tests or the entire collection

### Via Bruno CLI

```bash
# Install Bruno CLI
npm install -g @usebruno/cli

# Run all tests
cd bruno
bru run --env local

# Run specific test
bru run --env local "Health Check.bru"
```

## Test Structure

### Environments

- **local**: Points to `http://localhost:4000` (development)

### Test Flow

Tests should be run in sequence (seq numbers indicate order):

1. **Health Check** - Verify server is running
2. **Get All Todos** - Verify empty todo list
3. **Create Todo** - Create a test todo (saves ID for later tests)
4. **Create Todo - Validation Error** - Verify validation works
5. **Get Todo by ID** - Retrieve the created todo
6. **Update Todo** - Modify the todo
7. **Get Todo - Not Found** - Verify 404 errors
8. **Delete Todo** - Remove the test todo
9. **Get Todos by Date** - Filter todos by date

### Variables

- `baseUrl`: Server base URL (from environment)
- `apiPrefix`: API route prefix (`/api`)
- `todoId`: Stored after creating a todo (used in subsequent tests)

## Writing New Tests

Create a new `.bru` file in this directory:

```
meta {
  name: My Test
  type: http
  seq: 10
}

get {
  url: {{baseUrl}}{{apiPrefix}}/endpoint
  body: none
  auth: none
}

assert {
  res.status: eq 200
}

tests {
  test("description", function() {
    expect(res.getStatus()).to.equal(200);
  });
}
```

## CI/CD Integration

To run tests in CI pipelines:

```bash
# In your CI script
npm install -g @usebruno/cli
cd bruno
bru run --env local --output results.json
```

## Troubleshooting

**Tests fail with "Connection Refused"**
- Ensure the server is running: `bun run dev`
- Check the port matches the environment (default: 4000)

**Tests pass individually but fail in sequence**
- Check test dependencies (e.g., Create Todo must run before Get Todo by ID)
- Verify variable storage/retrieval (use Bruno's variable inspector)

**Validation tests fail**
- Ensure shared constants match (TEXT_LENGTH, etc.)
- Check error response format in server code
