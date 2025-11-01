# Testing Guide - Client

## Overview

The client uses **Vitest** with React Testing Library for testing. Tests run in a jsdom environment to simulate browser behavior without requiring a real browser.

## Test Structure

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx       # Component tests
├── hooks/
│   ├── useTask.ts
│   └── useTask.test.ts        # Hook tests
├── utils/
│   ├── formatDate.ts
│   └── formatDate.test.ts     # Utility tests
└── setupTests.ts              # Global test setup (jest-dom matchers)
```

Test files should be co-located with the code they test, using the naming convention:
- `ComponentName.test.tsx` for component tests
- `hookName.test.ts` for hook tests
- `utilityName.test.ts` for utility tests

## Running Tests

### All Tests
```bash
cd packages/client

# Run all tests in watch mode (default)
bun test

# Run all tests once (CI mode)
bun test run

# Run with coverage
bun test:ci
```

### Specific Tests
```bash
# Run tests matching a pattern
bun test Button

# Run a specific test file
bun test src/components/Button.test.tsx

# Run tests in a directory
bun test src/components/
```

### Watch Mode Options
In watch mode, press:
- `a` to run all tests
- `f` to run only failed tests
- `p` to filter by filename
- `t` to filter by test name
- `q` to quit

### With Coverage
```bash
bun test:ci
# Opens coverage report in coverage/ directory
```

## Test Configuration

Tests are configured in `vite.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,           // No need to import test(), describe(), expect()
    environment: 'jsdom',     // Simulates browser DOM
    setupFiles: './src/setupTests.ts',  // Setup jest-dom matchers
  },
});
```

## Writing Tests

### Component Tests

Test React components using React Testing Library:

```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Tests

Test custom React hooks:

```typescript
// src/hooks/useTask.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useTask } from './useTask';

describe('useTask', () => {
  test('fetches task data', async () => {
    const { result } = renderHook(() => useTask('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.task).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  test('handles errors', async () => {
    const { result } = renderHook(() => useTask('invalid-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.task).toBeNull();
    expect(result.current.error).toBeDefined();
  });
});
```

### Utility/Function Tests

Test pure functions and utilities:

```typescript
// src/utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  test('formats date correctly', () => {
    const date = new Date('2025-10-21');
    expect(formatDate(date)).toBe('October 21, 2025');
  });

  test('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

## Testing Library Utilities

### Queries (in order of preference)

1. **getByRole**: Most preferred (accessibility-friendly)
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   ```

2. **getByLabelText**: For form fields
   ```typescript
   screen.getByLabelText(/email/i)
   ```

3. **getByPlaceholderText**: For inputs
   ```typescript
   screen.getByPlaceholderText(/enter email/i)
   ```

4. **getByText**: For non-interactive elements
   ```typescript
   screen.getByText(/welcome/i)
   ```

5. **getByTestId**: Last resort (use sparingly)
   ```typescript
   screen.getByTestId('custom-element')
   ```

### Query Variants

- `getBy*`: Throws if not found
- `queryBy*`: Returns null if not found (for testing non-existence)
- `findBy*`: Returns promise (for async elements)

### User Interactions

Always use `userEvent` over `fireEvent`:

```typescript
import userEvent from '@testing-library/user-event';

test('user interaction', async () => {
  const user = userEvent.setup();

  await user.click(screen.getByRole('button'));
  await user.type(screen.getByRole('textbox'), 'Hello');
  await user.keyboard('{Enter}');
});
```

## Mocking

### Mocking Functions

```typescript
import { vi } from 'vitest';

test('mocks a function', () => {
  const mockFn = vi.fn();
  mockFn('hello');

  expect(mockFn).toHaveBeenCalledWith('hello');
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

### Mocking Modules

```typescript
import { vi } from 'vitest';

vi.mock('./api', () => ({
  fetchTasks: vi.fn(() => Promise.resolve([{ id: 1, title: 'Test' }])),
}));

test('uses mocked API', async () => {
  // Test code that uses fetchTasks
});
```

### Mocking Timers

```typescript
test('uses fake timers', () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

## Best Practices

### General
1. **Test behavior, not implementation**: Focus on what the user sees and does
2. **Use semantic queries**: Prefer `getByRole` for better accessibility
3. **Avoid testing internals**: Don't test state or props directly
4. **Keep tests simple**: One concept per test
5. **Use descriptive test names**: Explain what and why

### Component Testing
6. **Render the minimum**: Only render what you need to test
7. **Clean up after tests**: Use `cleanup()` (done automatically by React Testing Library)
8. **Test user workflows**: Test complete user interactions, not just functions
9. **Use act() when needed**: Vitest/RTL handles this automatically in most cases

### Async Testing
10. **Use findBy for async**: `findBy*` queries wait for elements to appear
11. **Use waitFor for async assertions**: Wait for conditions to be true
    ```typescript
    await waitFor(() => expect(screen.getByText('Loaded')).toBeInTheDocument());
    ```
12. **Don't use arbitrary timeouts**: Use proper async utilities

### Mocking
13. **Mock at the boundary**: Mock API calls, not internal functions
14. **Clear mocks between tests**: Use `vi.clearAllMocks()` in `afterEach()`
15. **Don't over-mock**: Only mock what's necessary

## Common Patterns

### Testing Forms

```typescript
test('submits form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<TaskForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/title/i), 'New task');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith({ title: 'New task' });
});
```

### Testing API Calls

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, title: 'Test task' }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches and displays tasks', async () => {
  render(<TaskList />);

  expect(await screen.findByText('Test task')).toBeInTheDocument();
});
```

### Testing Routing

```typescript
import { MemoryRouter } from 'react-router-dom';

test('navigates to task page', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  await user.click(screen.getByRole('link', { name: /tasks/i }));
  expect(screen.getByRole('heading', { name: /tasks/i })).toBeInTheDocument();
});
```

## Quick Reference

```bash
# Run all tests
bun test

# Run tests once (CI)
bun test run

# Run with coverage
bun test:ci

# Run specific test file
bun test Button.test.tsx

# Run tests matching pattern
bun test --grep "form validation"

# Update snapshots (if using snapshot testing)
bun test -u

# View coverage report
open coverage/index.html
```

## Troubleshooting

### Tests Failing Unexpectedly
- Clear Bun cache: `bun pm cache rm && bun install`
- Check for async issues: Use `findBy*` or `waitFor()`
- Ensure cleanup: Tests should be independent

### jsdom Limitations
- No layout calculation (offsetWidth, scrollHeight are 0)
- No actual rendering (use visual regression tests for UI)
- Limited Web API support (check jsdom docs)

### Module Resolution Issues
- Check `tsconfig.json` paths configuration
- Ensure imports match file structure
- Clear Bun cache if needed

### Coverage Issues
- Run with `--coverage.enabled` flag
- Check `coverage/` directory for reports
- Adjust coverage thresholds in `vite.config.ts` if needed

## CI Integration

Tests run automatically in GitHub Actions (`.github/workflows/client-ci.yml`) on push/PR:

- Linting: `bun run lint`
- Tests: `bun test run`
- Coverage: `bun test:ci`

All tests must pass before merging PRs.
