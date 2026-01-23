# Getting Started

Welcome to Alle! This guide will walk you through setting up your development environment and running the application.

## Prerequisites

Before you begin, make sure you have the latest version of [Bun](https://bun.sh) installed.

```bash
# Example of installing Bun on macOS with Homebrew
brew tap oven-sh/bun
brew install bun
```

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/alle.git
    cd alle
    ```

2.  **Install dependencies:**

    This project uses Bun for package management. The `bun install` command will install all dependencies for the entire monorepo.

    ```bash
    bun install
    ```

## Configuration

The application uses `.env` files for environment variables. There are `.env.example` files in both the `packages/client` and `packages/server` directories that you can copy to get started.

1.  **Server Configuration:**

    Copy `packages/server/.env.example` to `packages/server/.env`:

    ```bash
    cp packages/server/.env.example packages/server/.env
    ```

    The default server configuration looks like this:

    ```env
    # packages/server/.env
    PORT=4000                  # Server port
    CORS_ORIGIN=*              # CORS allowed origins
    NODE_ENV=development       # Environment
    ```

2.  **Client Configuration:**

    Copy `packages/client/.env.example` to `packages/client/.env`:

    ```bash
    cp packages/client/.env.example packages/client/.env
    ```

    The default client configuration looks like this:

    ```env
    # packages/client/.env
    VITE_API_URL=http://localhost:4000   # API server URL
    VITE_PORT=3000                       # Client dev server port
    ```

## Running the Application

You can run the client and server together or separately.

### Run Everything Together

The `dev` script is the easiest way to get started. It starts both the client and server in parallel and automatically handles port conflicts.

```bash
bun run dev
```

You should see output from both the server (in blue) and the client (in green).

### Run Separately

If you prefer to run the client and server in separate terminals, you can use the following commands:

*   **Start the server:**

    ```bash
    bun run server
    ```

    The server will be running at `http://localhost:4000`.

*   **Start the client:**

    ```bash
    bun run client
    ```

    The client will be running at `http://localhost:3000`.

## Development URLs

*   **Client**: `http://localhost:3000`
*   **Server**: `http://localhost:4000`
*   **Health Check**: `http://localhost:4000/api/health`

## Available Scripts

Here's a list of the most common scripts you'll use:

*   `bun run dev`: Start both client and server.
*   `bun run client`: Start the client development server.
*   `bun run server`: Start the server development server.
*   `bun run kill-ports`: A utility script to kill any processes running on ports 3000 and 4000.
*   `bun run validate`: Run all code quality checks (formatting, linting, and type-checking).
