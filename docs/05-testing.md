# Testing

This document provides an overview of the testing strategies and tools used in the Alle project. We believe that a solid testing strategy is crucial for building a high-quality, maintainable application.

## API Testing with Bruno

We use [Bruno](https://www.usebruno.com/) for API testing. Bruno is a fast, lightweight, and open-source API client that's perfect for both manual and automated testing.

### Why Bruno?

*   **Git-Friendly**: Tests are stored in a simple, plain-text format (`.bru` files), which makes them easy to version control.
*   **Developer-Friendly**: Bruno has a clean, intuitive UI that makes it easy to create and run tests.
*   **CLI Support**: Bruno has a powerful CLI that allows us to run our tests in automated workflows, such as CI/CD pipelines.
*   **Privacy-Focused**: Bruno is an offline tool, so you don't have to worry about your data being sent to the cloud.

### Running the API Tests

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

### Writing New API Tests

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

## End-to-End Testing with Playwright

We use [Playwright](https://playwright.dev/) for end-to-end (e2e) testing. Playwright is a modern, powerful, and reliable framework for browser automation.

### Running the E2E Tests

To run the end-to-end tests, use the following command:

```bash
bun run test:e2e
```

This will start the development server and then run the Playwright tests.

If you already have the server running, you can run the tests without starting a new server instance:

```bash
bun run test:e2e:no-server
```
