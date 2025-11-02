# Testing Guide - Client

## Overview

**Three-tier test strategy:** Unit → Integration → System/E2E

- **Unit**: Fast, isolated component/function tests (30 tests)
- **Integration**: Component interactions with mocked APIs (13 tests)
- **System**: Full-stack API tests with real backend (17 tests)
- **E2E**: End-to-end user workflows with Cypress

**Stack:** Vitest + React Testing Library + jsdom + MSW + Cypress

## Quick Reference

### Docker Testing (Recommended)

```bash
# Start the stack
docker-compose up -d

# Run tests (from packages/client directory)
bun install              # One-time setup
bun run test:unit        # 30 unit tests (~3s)
bun run test:integration # 13 integration tests (~4s)
bun run test:system      # 17 system tests (~3s) - uses Docker backend
bun run test:e2e         # Cypress E2E tests (~30s) - uses Docker stack
bun run test:e2e:open    # Cypress interactive mode

# Coverage
bunx vitest run --coverage

# Stop the stack
docker-compose down
```

### Manual Testing (Advanced)

```bash
# Development (watch mode, no backend needed)
bunx vitest

# CI-safe tests (no backend needed)
bun run test:unit
bun run test:integration

# Full-stack tests (requires manual backend startup)
# Terminal 1: cd ../../packages/server && cargo run
# Terminal 2:
bun run test:system       # Backend required
bun run test:e2e          # Backend + frontend required
```

## When to Run Which Tests

| Scenario | Command | Time | Docker |
|----------|---------|------|--------|
| During development | `docker-compose up -d && bunx vitest` | ~3s | Recommended |
| Before commit | `bun run test:unit && bun run test:integration` | ~7s | Not needed |
| Pre-push validation | `docker-compose up -d && bun run test:system` | ~3s | Required |
| Full E2E validation | `docker-compose up -d && bun run test:e2e` | ~30s | Required |

## Test Types

### Unit Tests (`*.test.tsx`, `*.test.ts`)

**Purpose:** Test individual components/functions in isolation

**Examples:**
- `src/api/task-api.test.ts` - API client functions
- `src/components/calendar/task-item/TaskItem.test.tsx` - Component behavior

**When:** Always. These run in CI/CD.

```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

test('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();

  render(<Button onClick={handleClick}>Click me</Button>);
  await user.click(screen.getByRole('button'));

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Integration Tests (`*.integration.test.tsx`)

**Purpose:** Test component interactions with mocked APIs

**Examples:**
- `src/pages/Home.integration.test.tsx` - Full page interactions

**When:** Before commits. These run in CI/CD.

```typescript
// src/pages/Home.integration.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from './Home';

test('creates a new task', async () => {
  const user = userEvent.setup();
  render(<Home />);

  await user.type(screen.getByPlaceholderText(/add a task/i), 'New task');
  await user.keyboard('{Enter}');

  expect(await screen.findByText('New task')).toBeInTheDocument();
});
```

### System Tests (`*.system.test.ts`)

**Purpose:** Test full-stack with real backend

**Examples:**
- `src/tests/system/frontend-backend.system.test.ts` - API integration

**When:** Pre-push, manual validation. **Excluded from CI/CD.**

**Setup:**

Docker (Recommended):
```bash
docker-compose up -d
cd packages/client && bun run test:system
docker-compose down
```

Manual (Advanced):
```bash
# Terminal 1: Backend
cd packages/server && cargo run

# Terminal 2: System tests
cd packages/client && bun run test:system
```

```typescript
// src/tests/system/frontend-backend.system.test.ts
test('creates a task in the database', async () => {
  const task = await taskAPI.createTask('System test task', new Date());

  expect(task.id).toBeDefined();
  expect(task.text).toBe('System test task');

  // Cleanup
  await taskAPI.deleteTask(task.id);
});
```

### E2E Tests (Cypress: `cypress/e2e/*.cy.ts`)

**Purpose:** End-to-end user workflows in real browser

**Examples:**
- `cypress/e2e/task-management.cy.ts` - Task CRUD operations
- `cypress/e2e/calendar-navigation.cy.ts` - UI navigation
- `cypress/e2e/user-workflows.cy.ts` - Real-world scenarios

**When:** Before releases, manual validation. **Excluded from CI/CD.**

**Setup:**

Docker (Recommended):
```bash
docker-compose up -d
cd packages/client
bun run test:e2e        # Headless
bun run test:e2e:open   # Interactive
docker-compose down
```

Manual (Advanced):
```bash
# Terminal 1: Backend
cd packages/server && cargo run

# Terminal 2: Frontend
cd packages/client && bun run dev

# Terminal 3: Cypress
cd packages/client
bun run test:e2e        # Headless
bun run test:e2e:open   # Interactive
```

```typescript
// cypress/e2e/task-management.cy.ts
describe('Task Management', () => {
  beforeEach(() => {
    cy.clearTasks();
    cy.visit('/');
  });

  it('creates a new task', () => {
    cy.contains('Today').parent().within(() => {
      cy.get('input[placeholder="Add a task..."]')
        .type('Buy groceries{enter}');
    });

    cy.contains('Buy groceries').should('be.visible');
  });
});
```

## Test Configuration

### File Locations
```
packages/client/
├── vite.config.ts              # Vitest config (auto-excludes system tests)
├── cypress.config.ts           # Cypress config
├── src/
│   ├── setupTests.ts          # Vitest setup (jest-dom matchers)
│   ├── tests/
│   │   ├── mocks/setup.ts     # MSW for GraphQL mocking
│   │   ├── fixtures/          # Mock data
│   │   └── system/            # System test files
│   └── components/            # Component tests co-located
└── cypress/
    ├── e2e/                   # E2E test specs
    ├── support/
    │   ├── e2e.ts            # Cypress setup
    │   └── commands.ts        # Custom commands (clearTasks, createTask)
    └── fixtures/              # Test data
```

### Key Config

**vite.config.ts:**
```typescript
export default defineConfig({
  test: {
    globals: true,         // No need to import test(), describe(), expect()
    environment: 'jsdom',  // Simulates browser DOM
    setupFiles: './src/setupTests.ts',
    exclude: [
      // System tests excluded by default
      ...(process.env.INCLUDE_SYSTEM_TESTS !== 'true'
        ? ['**/*.system.test.ts']
        : []),
    ],
  },
});
```

## Best Practices

### General
1. **Test behavior, not implementation** - Test what users see/do
2. **Use semantic queries** - Prefer `getByRole` for accessibility
3. **Co-locate tests** - Keep tests next to code they test
4. **One concept per test** - Simple, focused tests
5. **Descriptive names** - Explain what and why

### Query Priority
1. `getByRole` - Most preferred (accessibility-friendly)
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - For inputs
4. `getByText` - For non-interactive elements
5. `getByTestId` - Last resort (use `data-testid` attribute)

### User Interactions
Always use `userEvent` over `fireEvent`:
```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(screen.getByRole('button'));
await user.type(screen.getByRole('textbox'), 'Hello');
await user.keyboard('{Enter}');
```

### Async Testing
```typescript
// Use findBy* for elements that appear asynchronously
const element = await screen.findByText('Loaded');

// Use waitFor for complex conditions
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Mocking
```typescript
import { vi } from 'vitest';

// Mock functions
const mockFn = vi.fn();
expect(mockFn).toHaveBeenCalledWith('hello');

// Mock modules
vi.mock('./api', () => ({
  fetchTasks: vi.fn(() => Promise.resolve([{ id: 1, title: 'Test' }])),
}));

// Mock timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

## Troubleshooting

### Tests Failing
- **Async issues**: Use `findBy*` or `waitFor()`
- **Cleanup issues**: Tests should be independent
- **Mock issues**: Clear mocks in `afterEach(() => vi.clearAllMocks())`

### System Tests Failing
- **Backend not running**: Start with `docker-compose up -d` (recommended) or `cd packages/server && cargo run`
- **Port conflict**: Check port 8000 is available, stop other services
- **Database issues**: Docker handles this automatically

### E2E Tests Failing
- **Backend/frontend not running**: Start with `docker-compose up -d` (recommended)
- **Port conflicts**: Check ports 8000 (backend) and 5173 (frontend)
- **Timing issues**: Increase `defaultCommandTimeout` in `cypress.config.ts`
- **Docker issues**: Ensure Docker is running and containers are healthy

### Coverage Issues
```bash
# Generate coverage report
bunx vitest run --coverage

# View coverage
open coverage/index.html
```

## CI/CD

Tests run automatically in GitHub Actions (`.github/workflows/client-ci.yml`):

**What runs in CI:**
- ✅ Unit tests (`bun run test:unit`)
- ✅ Integration tests (`bun run test:integration`)
- ❌ System tests (excluded - need backend)
- ❌ E2E tests (excluded - need full stack)

**Why excluded:**
System and E2E tests require running servers. While the server uses Docker/testcontainers for its integration tests (which work in CI), client system/E2E tests need the actual backend server running.

**To run system tests in CI** (optional):
1. Add backend service to workflow
2. Set `INCLUDE_SYSTEM_TESTS=true` environment variable
3. Run tests after backend is ready

## Additional Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io)
- [MSW Documentation](https://mswjs.io)
