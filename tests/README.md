# Testing Guide

This directory contains the tests for the Alle application.

-   [`api`](./api) — API tests written with [Bruno](https://www.usebruno.com/).
-   [`e2e`](./e2e) — End-to-end tests written with [Playwright](https://playwright.dev/).

To learn more about our testing strategy, see the [**Testing**](../docs/05-testing.md) documentation.

## Running Tests

### All Tests

```bash
bun run test        # Run all unit tests
```

### Unit Tests

```bash
bun run test:unit             # All unit tests
bun run test:unit:shared      # Shared package only
bun run test:unit:server      # Server package only
bun run test:unit:client      # Client package only
bun test --watch              # Watch mode
```

### E2E Tests

```bash
bun run test:e2e              # Start server + run tests
bun run test:e2e:no-server    # Run tests (server already running)
```

### API Tests

```bash
bun run test:api              # Run Bruno API tests
```

### Storybook

```bash
bun run storybook             # Start Storybook dev server
bun run build-storybook       # Build static Storybook
```

## Pre-commit Hooks

Husky runs validation before each commit:

-   Linting (Biome)
-   Formatting (Biome)
-   Type checking (TypeScript)

To bypass (not recommended):

```bash
git commit --no-verify
```

## CI/CD Pipeline

GitHub Actions runs on every PR:

1. Quality checks (lint, format, type-check)
2. Unit tests
3. E2E tests
4. API tests
5. Build verification
6. Storybook build
7. Security audit

All checks must pass before merging.

## Writing Tests

See `docs/05-testing.md` for comprehensive testing standards.

### Quick Example

```typescript
import { describe, expect, test } from 'bun:test';

describe('Feature', () => {
    test('should do something', () => {
        const result = doSomething();
        expect(result).toBe(expected);
    });
});
```
