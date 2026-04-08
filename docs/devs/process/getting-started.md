# Getting Started

Welcome to Alle! This guide will walk you through setting up your development environment and running the application.

## Prerequisites

Before you begin, make sure you have the following installed:

- [mise](https://mise.jdx.dev) — the project's task runner and tool version manager
- [Bun](https://bun.sh) — managed automatically by mise

```bash
# Install mise (macOS with Homebrew)
brew install mise

# Activate mise in your shell (add to ~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish)
mise activate
```

Once mise is installed, it will automatically use the correct Bun version defined in `mise.toml`.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/alle.git
    cd alle
    ```

2.  **Install dependencies:**

    This project uses Bun for package management. Run via mise to ensure the correct Bun version is used:

    ```bash
    mise run install
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

The `dev` task is the easiest way to get started. It starts both the client and server in parallel.

```bash
mise run dev
```

You should see output from both the server (in blue) and the client (in green).

### Run Separately

If you prefer to run the client and server in separate terminals:

*   **Start the server:**

    ```bash
    mise run server
    ```

    The server will be running at `http://localhost:4000`.

*   **Start the client:**

    ```bash
    mise run client
    ```

    The client will be running at `http://localhost:3000`.

## Development URLs

*   **Client**: `http://localhost:3000`
*   **Server**: `http://localhost:4000`
*   **Health Check**: `http://localhost:4000/api/health`

## Available Tasks

All tasks are run via `mise run <task>`. Here's the full list:

### Dev servers
| Task | Description |
|------|-------------|
| `mise run dev` | Start client and server in parallel |
| `mise run client` | Start client dev server (port 3000) |
| `mise run server` | Start server dev server (port 4000) |
| `mise run storybook` | Start Storybook (port 6006) |

### Code quality
| Task | Description |
|------|-------------|
| `mise run format` | Format all files with Biome (auto-fix) |
| `mise run lint` | Lint all files with Biome (auto-fix) |
| `mise run biome-check` | Check lint + format without auto-fix (CI mode) |
| `mise run type-check` | Type-check all packages |

### Testing
| Task | Description |
|------|-------------|
| `mise run test` | Run all unit tests |
| `mise run test-watch` | Run unit tests in watch mode |
| `mise run test-coverage` | Run unit tests with coverage |
| `mise run test-e2e` | Run Playwright E2E tests |
| `mise run test-api` | Run Bruno API tests against local server |
| `mise run test-all` | Run API and E2E tests in parallel |

### Build
| Task | Description |
|------|-------------|
| `mise run build` | Build all packages |
| `mise run build-storybook` | Build Storybook |

### CI
| Task | Description |
|------|-------------|
| `mise run ci` | Full CI pipeline locally (mirrors GitHub Actions) |
| `mise run security` | Run security audit |

---

## Contributing

- **Bug reports**: [Open an issue](https://github.com/natestott/alle/issues) with as much detail as possible.
- **Feature requests**: [Open an issue](https://github.com/natestott/alle/issues) to discuss the idea first.
- **Pull requests**: Fork the repo, create a branch, make your changes, run `bun run validate`, then submit a PR. See [git-workflow.md](./git-workflow.md) for branching conventions and commit standards.
