# E2E Tests

This directory contains the end-to-end tests for the Alle application, which are written using [Playwright](https://playwright.dev/).

## ⚡️ Quick Start

To run the end-to-end tests, use the following command:

```bash
bun run test:e2e
```

This will start the development server and then run the Playwright tests.

If you already have the server running, you can run the tests without starting a new server instance:

```bash
bun run test:e2e:no-server
```

## 📚 Learn More

To learn more about our testing strategy and how we use Playwright, check out the [**Testing**](../../docs/05-testing.md) documentation.
