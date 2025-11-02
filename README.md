# Alle

> A minimalist to-do list app inspired by [Teuxdeux](https://teuxdeux.com)

**Task management that stays out of your way.** Clean, distraction-free interface with powerful automation under the hood. Tasks automatically roll over when you don't finish them, recurring tasks handle themselves, and everything works offline. No complexity, no clutter—just you and your to-dos.

## Features

- **Drag-and-drop** task organization
- **Automatic rollover** for incomplete tasks
- **Recurring tasks** with flexible patterns
- **Offline mode** for uninterrupted productivity
- **Markdown support** for rich text formatting

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 19 + TypeScript | Rust + Tokio |
| Vite build tool | async-graphql |
| Tailwind CSS | SeaORM + SQLite |
| Bun runtime | Tower HTTP |

## Quick Start

### With Docker (Recommended)

No dependencies needed - just install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# Start the entire stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the app:** http://localhost:5173
**GraphQL API:** http://localhost:8000/graphql

### Without Docker

**Prerequisites:**
- [Bun](https://bun.sh) - JavaScript runtime
- [Rust](https://rustup.rs) - Backend toolchain

**Installation:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Running the app:**
```bash
# Terminal 1: Start backend
cd packages/server
cargo run
# Runs on http://localhost:8000

# Terminal 2: Start frontend
cd packages/client
bun install
bun run dev
# Runs on http://localhost:5173
```

## Development

### Project Structure

```
alle/
├── packages/
│   ├── client/          # React frontend
│   │   ├── src/
│   │   ├── docs/        # Client documentation
│   │   └── cypress/     # E2E tests
│   └── server/          # Rust backend
│       ├── src/
│       ├── docs/        # Server documentation
│       └── tests/
├── docs/                # Project-wide docs
└── .github/workflows/   # CI/CD pipelines
```

### Common Commands

**Client (Frontend):**
```bash
cd packages/client
bun run dev              # Start dev server
bun run build            # Production build
bun run lint             # Run ESLint
bun run storybook        # Component explorer
```

**Server (Backend):**
```bash
cd packages/server
cargo run                # Start server
cargo build --release    # Production build
cargo fmt                # Format code
cargo clippy             # Lint code
```

## Testing

### Client Tests

Three-tier testing strategy: **Unit** → **Integration** → **System/E2E**

```bash
cd packages/client

# Fast tests (no backend required)
bun run test:unit           # 30 unit tests (~3s)
bun run test:integration    # 13 integration tests (~4s)

# Full stack tests (requires backend)
bun run test:system         # 17 system tests (~3s)
bun run test:e2e            # Cypress E2E tests (~30s)
bun run test:e2e:open       # Cypress interactive mode

# Development
bunx vitest                 # Watch mode
bunx vitest run --coverage  # Coverage report
```

**Running system/E2E tests:**
```bash
# With Docker (recommended)
docker-compose up -d
bun run test:system

# Without Docker
# Terminal 1: Start backend
cd packages/server && cargo run

# Terminal 2: Run tests
cd packages/client && bun run test:system
```

### Server Tests

```bash
cd packages/server

# Run all tests
cargo test

# Run specific test suites
cargo test unit              # Unit tests
cargo test integration       # Integration tests
cargo test --verbose         # Detailed output
```

**Note:** Server integration tests use Docker/testcontainers for database setup.

## Documentation

### Getting Started
- [Project Vision](docs/high-level-idea.md) - Complete feature roadmap
- [Contributing Guide](docs/contributing.md) - How to contribute

### Frontend Development
- [Adding Features](packages/client/docs/adding-features.md) - Component structure guide
- [Testing Guide](packages/client/docs/testing.md) - Comprehensive testing docs
- [Code Standards](packages/client/docs/standards.md) - Style and patterns

### Backend Development
- [Adding Entities](packages/server/docs/adding-entities.md) - Domain-driven architecture
- [Database Schema](packages/server/docs/schema.md) - Database models

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** your changes (`bun run test:unit && bun run test:integration`)
5. **Lint** your code (`bun run lint` or `cargo clippy`)
6. **Commit** your changes (`git commit -m 'Add amazing feature'`)
7. **Push** to your branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

See [CONTRIBUTING.md](docs/contributing.md) for detailed guidelines.

## Git Workflow

```
stable/<date> (releases) ← main (production) ← test (QA) ← dev (integration)
                                                                ↑
                                            feature/*, fix/*, refactor/*
```

**Branch from `dev`** for new features. See [contributing guide](docs/contributing.md) for details.

## License

**GPL-3.0-or-later**

Free to use, modify, and distribute. Modified versions must share source code under GPL-3.0.

See [LICENSE](LICENSE) for full details.

---

**Inspired by [Teuxdeux](https://teuxdeux.com)** - Built with ❤️ by the open source community
