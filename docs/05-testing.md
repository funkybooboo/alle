# Testing

This document defines the comprehensive testing strategy, standards, and tools for the Alle project. These standards are **MANDATORY** and **ENFORCED** through CI/CD pipelines, code reviews, and automated quality gates.

## Philosophy

Our testing approach prioritizes **quality over arbitrary coverage metrics**:

- **Test behavior, business logic, and user value** — not implementation details
- **Zero tolerance for flaky tests** — tests MUST be deterministic and reliable
- **Test-first mindset** — tests are first-class citizens, not afterthoughts
- **Real dependencies over mocks** — use actual databases, services, and systems
- **Meaningful coverage** — 85%+ expected, but 100% of critical paths REQUIRED

---

## Core Principles

### 1. Quality Over Coverage

**RULE**: We prioritize meaningful tests over arbitrary coverage metrics.

- 85%+ code coverage is **EXPECTED**
- 100% coverage of critical business paths is **MANDATORY**
- Every business rule MUST have explicit test coverage
- Code without tests CANNOT be merged

### 2. Zero Tolerance for Flaky Tests

**RULE**: Tests MUST be deterministic and reliable.

- Tests that fail intermittently are treated as broken code
- All tests MUST be idempotent (can run multiple times with same result)
- NO shared state between tests
- NO dependency on external services in unit tests
- Flaky tests MUST be fixed immediately or disabled and tracked

### 3. Test-First Mindset

**RULE**: Tests are first-class citizens, not afterthoughts.

- All new features MUST include tests before implementation
- Breaking changes REQUIRE test updates first
- Refactoring without tests is **PROHIBITED**
- Test code quality is as important as production code quality

---

## Testing Pyramid

We follow a strict testing pyramid distribution:

```
    /\
   /  \  E2E Tests (10%)
  /----\
 / Inte \  Integration Tests (20%)
/--------\
|  Unit  |  Unit Tests (70%)
|________|
```

### Unit Tests: 70% of Test Suite

**PURPOSE**: Test individual pure functions and isolated business logic in milliseconds.

**SCOPE**: Pure functions, calculations, validations, transformers, business rules.

**TOOLS**: Bun test runner, Vitest, React Testing Library.

**REQUIREMENTS**:
- Every pure function MUST have comprehensive unit tests
- Test all edge cases, error conditions, and business rules
- NO mocks or stubs allowed (pure functions don't need them)
- Tests MUST run in under 1 second total
- Use property-based testing for complex algorithms

**WHAT TO TEST**:
- ✅ Pure business logic and calculations
- ✅ Data transformations and validators
- ✅ Domain rules and policies
- ✅ Utility functions and helpers
- ✅ Error handling in pure functions

**WHAT NOT TO TEST**:
- ❌ Components with side effects
- ❌ API calls or database operations
- ❌ Framework code or third-party libraries
- ❌ Trivial getters/setters
- ❌ Implementation details

### Integration Tests: 20% of Test Suite

**PURPOSE**: Test how multiple components work together with real dependencies.

**SCOPE**: Database operations, service integrations, adapter implementations, data flows.

**TOOLS**: Testcontainers, Docker, Bun test runner.

**REQUIREMENTS**:
- Integration tests MUST use temporary Docker containers
- NO shared databases or services between tests
- Each test class MUST get its own container instances
- Tests MUST run in under 30 seconds total
- Cleanup MUST be automatic and guaranteed

**WHAT TO TEST**:
- ✅ Database interactions (create, read, update, delete)
- ✅ Transaction handling and rollbacks
- ✅ Data consistency and constraints
- ✅ Service-to-service communication
- ✅ Adapter implementations with real backing services
- ✅ Concurrent access scenarios
- ✅ Error propagation across layers

**DOCKER CONTAINER REQUIREMENT**:

All integration tests MUST use Testcontainers:

```typescript
import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";

describe('UserRepository Integration', () => {
  let container;
  let sql;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_pass')
      .start();

    sql = postgres({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: container.getDatabase(),
      username: container.getUsername(),
      password: container.getPassword(),
    });

    // Setup schema
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
  }, 60000);

  afterAll(async () => {
    if (sql) await sql.end();
    if (container) await container.stop();
  });

  beforeEach(async () => {
    await sql`TRUNCATE users RESTART IDENTITY CASCADE`;
  });

  // Tests here...
});
```

### End-to-End Tests: 10% of Test Suite

**PURPOSE**: Test complete user workflows and critical business journeys.

**SCOPE**: Full user stories, acceptance criteria, cross-browser compatibility.

**TOOLS**: Playwright, Cypress.

**REQUIREMENTS**:
- E2E tests MUST cover ALL user stories
- Each acceptance criterion MUST map to at least one E2E test
- Tests MUST run in under 5 minutes total
- Tests MUST include accessibility checks
- Tests MUST include performance assertions

**WHAT TO TEST**:
- ✅ Complete user journeys from start to finish
- ✅ Critical business workflows
- ✅ User authentication and authorization flows
- ✅ Error scenarios and recovery paths
- ✅ Cross-browser compatibility
- ✅ Performance under realistic conditions
- ✅ Accessibility compliance (WCAG 2.1 AA)

---

## Testing Tools

### Bun Test Runner (Unit & Integration Tests)

We use Bun's built-in test runner for its speed and simplicity.

**Running Tests**:
```bash
# Run all tests
bun test

# Run specific test file
bun test math.test.ts

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

**Example Test**:
```typescript
import { test, expect, describe } from "bun:test";

describe('Math utilities', () => {
  test('addition works', () => {
    expect(2 + 2).toBe(4);
  });

  test('async operations', async () => {
    const result = await fetchData();
    expect(result.status).toBe('success');
  });
});
```

### Playwright (End-to-End Tests)

We use [Playwright](https://playwright.dev/) for end-to-end (e2e) testing. Playwright is a modern, powerful, and reliable framework for browser automation.

**Running the E2E Tests**:

```bash
# Start dev server and run tests
bun run test:e2e

# Run tests without starting server (if already running)
bun run test:e2e:no-server
```

**Example E2E Test**:
```typescript
import { test, expect } from '@playwright/test';

test('user can create a task', async ({ page }) => {
  await page.goto('/');

  await page.fill('[data-testid="task-input"]', 'Buy groceries');
  await page.click('[data-testid="add-task-button"]');

  await expect(page.locator('[data-testid="task-item"]')).toContainText('Buy groceries');
});
```

### Bruno (API Tests)

We use [Bruno](https://www.usebruno.com/) for API testing. Bruno is a fast, lightweight, and open-source API client that's perfect for both manual and automated testing.

**Why Bruno?**

*   **Git-Friendly**: Tests are stored in a simple, plain-text format (`.bru` files), which makes them easy to version control.
*   **Developer-Friendly**: Bruno has a clean, intuitive UI that makes it easy to create and run tests.
*   **CLI Support**: Bruno has a powerful CLI that allows us to run our tests in automated workflows, such as CI/CD pipelines.
*   **Privacy-Focused**: Bruno is an offline tool, so you don't have to worry about your data being sent to the cloud.

**Running the API Tests**:

1.  **Start the server:**

    ```bash
    bun run server
    ```

2.  **Run the tests:**

    *   **GUI**: Open the Bruno app, open the `tests/api` collection, select the `local` environment, and run the tests.
    *   **CLI**:

        ```bash
        # Make sure you have the Bruno CLI installed
        # npm install -g @usebruno/cli

        cd tests/api
        bru run --env local
        ```

**Writing New API Tests**:

To add a new API test, simply create a new `.bru` file in the `tests/api` directory. The file format is simple and easy to understand.

Here's an example of a basic test:

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
```

For more information on writing tests, see the [Bruno documentation](https://docs.usebruno.com/).

---

## API Testing Requirements

**RULE**: Every public API endpoint MUST have exhaustive test coverage.

**REQUIREMENTS**:
- Test ALL HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Test ALL status codes (200, 201, 400, 401, 403, 404, 409, 500, etc.)
- Validate request and response schemas
- Test authentication and authorization thoroughly
- Cover ALL error scenarios
- Test rate limiting and throttling
- Test concurrent requests
- Validate CORS headers
- Test content negotiation
- Performance test critical endpoints

**MANDATORY TEST CASES FOR EACH ENDPOINT**:

1. **Success Cases**
   - Valid request returns correct status
   - Response schema is correct
   - Response headers are correct
   - Side effects occur as expected

2. **Validation Errors**
   - Missing required fields return 400
   - Invalid field types return 400
   - Invalid field values return 400
   - Error response includes field-level details

3. **Authentication/Authorization**
   - Missing auth token returns 401
   - Invalid auth token returns 401
   - Insufficient permissions return 403
   - Correct permissions allow access

4. **Not Found Scenarios**
   - Non-existent resources return 404
   - Error response is informative

5. **Conflict Scenarios**
   - Duplicate resources return 409
   - Concurrent updates are handled correctly

6. **Content Type Handling**
   - Non-JSON content type returns 415
   - Malformed JSON returns 400

---

## Component Testing Requirements

**RULE**: All UI components MUST have comprehensive Storybook stories.

**REQUIREMENTS**:
- Every component MUST have Storybook stories
- All component states and variations MUST be documented
- Interactive testing capabilities MUST be included
- Visual regression testing MUST be integrated
- Accessibility tests MUST be included

**MANDATORY STORIES FOR EACH COMPONENT**:

1. **Default State** — component in its normal state
2. **All Variants** — every visual variant (primary, secondary, danger, etc.)
3. **All Sizes** — every size option (small, medium, large, etc.)
4. **Interactive States** — default, hover, active, focus, disabled, loading
5. **Error States** — validation errors, network errors, etc.
6. **Edge Cases** — empty state, long content, overflow handling
7. **Accessibility Test** — keyboard navigation, screen reader support

```typescript
// Button.stories.ts
export default {
  title: 'Design System/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost']
    }
  }
};

export const Primary = {
  args: { children: 'Primary Button', variant: 'primary' }
};

export const AllSizes = () => (
  <div style={{ display: 'flex', gap: '1rem' }}>
    <Button size="small">Small</Button>
    <Button size="medium">Medium</Button>
    <Button size="large">Large</Button>
  </div>
);

export const InteractiveStates = () => (
  <div style={{ display: 'grid', gap: '1rem' }}>
    <Button>Default</Button>
    <Button disabled>Disabled</Button>
    <Button loading>Loading</Button>
  </div>
);
```

---

## The NO MOCKS Policy

**RULE**: NEVER use mocks. Use real dependencies instead.

**WHY**: Mocks test implementation details, not behavior. They create false confidence and brittle tests that break during refactoring.

### What to Use Instead

- **Real databases**: Use Docker containers with Testcontainers
- **Real HTTP services**: Use test adapters or running services in containers
- **Real file systems**: Use temporary directories that are cleaned up
- **Real time**: Use `DateProvider` adapter with test implementation
- **Test doubles for external APIs**: Create test implementations, not mocks

### Exceptions (Rare)

The ONLY acceptable use of test doubles:
- External APIs you don't control (payment processors, email services)
- Even then, create a test adapter implementation, not a mock

❌ **NEVER ALLOWED**:
```typescript
// BAD - Testing implementation details with mocks
const mockRepository = {
  save: jest.fn(),
  findById: jest.fn()
};

expect(mockRepository.save).toHaveBeenCalledTimes(1);
```

✅ **REQUIRED**:
```typescript
// GOOD - Test behavior with real implementation
const repository = new InMemoryTaskRepository();
const task = await repository.save({ text: 'Test task' });
const retrieved = await repository.findById(task.id);

expect(retrieved.text).toBe('Test task');
```

---

## Test Behavior, Not Implementation

**RULE**: Tests MUST survive refactoring.

### Focus on WHAT, Not HOW

- Test the public API and observable behavior
- Don't test private methods or internal state
- Don't assert on the number of function calls
- Don't test the order of operations (unless it's part of the contract)

❌ **BAD** — Testing implementation:
```typescript
test('should call setState twice', () => {
  const mockSetState = jest.fn();
  component.setState = mockSetState;
  component.handleClick();
  expect(mockSetState).toHaveBeenCalledTimes(2);  // Implementation detail
});
```

✅ **GOOD** — Testing behavior:
```typescript
test('when user clicks button, counter should increment', async () => {
  render(<Counter />);

  const button = screen.getByRole('button', { name: 'Increment' });
  await user.click(button);

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

---

## Idempotent and Clean Tests

**RULE**: Tests MUST be idempotent and leave no side effects.

### Idempotency Requirements

- Tests MUST produce the same result when run multiple times
- Tests MUST NOT depend on execution order
- Tests MUST NOT depend on external state
- Tests MUST work in parallel execution

### Cleanup Requirements

- Database containers MUST be stopped after tests
- Temporary files MUST be deleted
- Test data MUST NOT pollute production systems
- Connections MUST be properly closed

```typescript
describe('Service Tests', () => {
  let container;
  let db;

  beforeAll(async () => {
    container = await startContainer();
    db = await connectToContainer(container);
  });

  afterAll(async () => {
    if (db) await db.disconnect();
    if (container) await container.stop();  // REQUIRED
  });

  beforeEach(async () => {
    await db.clearAllTables();  // REQUIRED for test isolation
  });
});
```

---

## Test Quality Standards

### Naming Conventions

Tests MUST use descriptive, behavior-focused names:

```typescript
// ❌ BAD
test('test1', () => { /* ... */ });
test('should work', () => { /* ... */ });

// ✅ GOOD
test('when user provides valid email, should create account', () => { /* ... */ });
test('when password is too short, should reject with validation error', () => { /* ... */ });
```

### Test Structure (AAA Pattern)

All tests MUST follow Arrange-Act-Assert pattern:

```typescript
test('should calculate discount for verified students', () => {
  // Arrange
  const user = { type: 'student', verified: true };
  const basePrice = 100;

  // Act
  const result = PricingEngine.calculateDiscount(basePrice, user);

  // Assert
  expect(result.finalPrice).toBe(90);
  expect(result.discountType).toBe('student');
});
```

### Test Independence

- Each test MUST be completely independent
- NO shared mutable state between tests
- NO test execution order dependencies
- Tests MUST pass when run in isolation or in any order

---

## CI/CD Requirements

**RULE**: CI MUST pass before merging.

### Quality Gates

ALL of the following MUST pass before merge:

1. **All tests pass** (unit, integration, E2E, API)
2. **Coverage ≥ 85%** (measured, enforced)
3. **No flaky tests** (0% tolerance)
4. **Linting passes** (Biome)
5. **Type checking passes** (TypeScript strict mode)
6. **Performance tests pass** (no regressions)
7. **Security scans pass** (dependency vulnerabilities)
8. **Accessibility tests pass** (WCAG 2.1 AA)

### Automated Test Execution

```bash
# Full test suite
bun run test

# Individual test types
bun run test:unit
bun run test:integration
bun run test:e2e
bun run test:api

# With coverage
bun run test --coverage

# Watch mode (development)
bun run test --watch
```

---

## Test-Driven Development (TDD)

**RECOMMENDED APPROACH**: Use TDD for all new features.

### The Red-Green-Refactor Cycle

1. **RED** — Write a failing test that defines desired behavior
2. **GREEN** — Write the minimal code needed to make the test pass
3. **REFACTOR** — Improve the code while keeping tests green

### TDD at Different Levels

**E2E Tests First** (Acceptance Test-Driven Development):
- Write E2E test for user story acceptance criteria
- Test fails because feature doesn't exist
- Implement feature to make test pass

**Unit Tests During Development** (Traditional TDD):
- Write failing unit test for specific behavior
- Implement function to pass test
- Refactor for clarity and performance

**Integration Tests for Data Flows**:
- Write test for database operation or service integration
- Implement repository or adapter
- Verify side effects and error handling

---

## Summary: Testing Checklist

Before merging ANY code, ensure:

- [ ] Unit tests cover all pure functions and business logic
- [ ] Integration tests use real Docker containers (NO mocks)
- [ ] E2E tests cover all user stories and acceptance criteria
- [ ] API tests cover all endpoints comprehensively
- [ ] Component stories exist for all UI components
- [ ] All tests are idempotent and clean up after themselves
- [ ] Test coverage is ≥ 85% (100% for critical paths)
- [ ] NO flaky tests exist
- [ ] CI pipeline passes completely
- [ ] Tests focus on behavior, not implementation
- [ ] Test code quality matches production code quality

**Remember**: Tests are not a checkbox exercise. They are **living documentation** of how your system behaves and a **safety net** for future changes. Invest in test quality now to move faster later.
