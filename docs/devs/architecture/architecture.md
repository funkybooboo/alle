# Architecture

This document provides a high-level overview of the architecture of the Alle application. Our architecture is designed to be modular, scalable, and easy to maintain.

## Monorepo

Alle is a monorepo managed with [Bun Workspaces](https://bun.sh/docs/cli/workspaces). This means that the client, server, and shared code are all in the same repository, but are treated as separate packages.

### Project Structure

```
alle/
├── packages/
│   ├── client/          # React frontend
│   ├── server/          # Bun API server
│   └── shared/          # Shared types and utilities
├── docs/                # Project documentation
├── tests/               # API and e2e tests
└── package.json         # Root workspace config
```

*   **`packages/client`**: A React application built with Vite.
*   **`packages/server`**: a Bun HTTP server that exposes a REST API.
*   **`packages/shared`**: A package that contains code shared between the client and server, such as types, interfaces, and constants.

## The Adapter Pattern

A cornerstone of our architecture is the **adapter pattern**. This pattern allows us to decouple our application's core logic from the specific implementations of its dependencies. We define a generic interface (the "port") in our application, and then create concrete implementations (the "adapters") for different technologies or environments.

### Core Adapters

*   **`ConfigProvider`**: Abstracts access to configuration.
    *   **`ViteConfigProvider`** (client): Reads configuration from `import.meta.env`.
    *   **`EnvConfigProvider`** (server): Reads configuration from `process.env`.
*   **`HttpClient`**: Abstracts HTTP communication.
    *   **`FetchHttpClient`** (shared): A universal implementation using the `fetch` API.
*   **`Logger`**: Abstracts logging.
    *   **`ConsoleLogger`** (shared): A simple implementation that logs to the console.
*   **`HttpServer`**: Abstracts the underlying HTTP server.
    *   **`BunHttpServer`** (server): An implementation using Bun's native HTTP server.
*   **`TaskRepository`**: Abstracts data persistence for tasks.
    *   **`InMemoryTaskRepository`** (server): An in-memory implementation for development and testing.

### Benefits of the Adapter Pattern

*   **Flexibility**: We can easily swap out implementations without changing our application's code. For example, we could replace the `InMemoryTaskRepository` with a `PostgresTaskRepository` to use a real database.
*   **Testability**: We can easily mock our dependencies in our tests. For example, we can use a `MockHttpClient` to simulate API calls.
*   **Maintainability**: The separation of concerns makes our code easier to understand, maintain, and reason about.

## Dependency Injection

We use a simple dependency injection (DI) container to manage our application's dependencies. The container is responsible for creating and providing instances of our adapters.

```typescript
// packages/server/src/container.ts
export const container = new Container()

// Lazily create and provide an instance of the TaskRepository
const taskRepo = container.taskRepository // Swap InMemory → Postgres here
```

This approach allows us to easily manage the lifecycle of our dependencies and provides a central place to configure our application.

## The Shared Package (`@alle/shared`)

The `@alle/shared` package is the secret sauce that enables type-safe, end-to-end communication between our client and server. It contains all the code that is shared between the two, including:

*   **Types**: All of our data models, such as `Task` and `User`.
*   **API Contracts**: The request and response types for our API endpoints.
*   **Constants**: Shared constants like API routes and validation rules.
*   **Interfaces**: The adapter interfaces described above.
*   **Universal Implementations**: Implementations of our adapters that can run in both the browser and Bun (e.g., `FetchHttpClient`).

### The Golden Rule of the Shared Package

When deciding whether to put a piece of code in the `@alle/shared` package, ask yourself this question:

> **Does the client need this code?**

If the answer is **no**, put it in the `packages/server`. If the answer is **yes**, then ask:

> **Does the server also need this code?**

If the answer is **yes**, put it in `packages/shared`. If the answer is **no**, put it in `packages/client`.

This simple rule ensures that our shared package remains lean and that we maintain a clear separation of concerns.

## 12-Factor App Compliance

The application is designed to follow the principles of a [12-Factor App](https://12factor.net/). This means that it is:

*   **Stateless**: The server does not store any state between requests.
*   **Configurable**: All configuration is stored in the environment.
*   **Portable**: It can be easily run in different environments.
*   **Scalable**: It can be scaled horizontally by adding more instances of the server.

## Ready for Docker

The application is designed to be easily containerized with Docker. The stateless architecture, environment-based configuration, and self-contained nature of the application make it a perfect candidate for containerization.
