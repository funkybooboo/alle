# Alle

Open-source minimalist to-do list app inspired by Teuxdeux. Clean, simple, and focused on getting things done.

## Features

- Drag-and-drop task organization
- Automatic task rollover
- Recurring to-dos
- Someday lists for long-term planning
- Offline functionality
- Markdown and emoji support

See [`docs/high-level-idea.md`](docs/high-level-idea.md) for complete feature list.

## Tech Stack

**Frontend**: React 19 + TypeScript + Vite + Bun
**Backend**: Rust + Tokio async runtime

## Quick Start

### Prerequisites

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Running the App

**Client** (frontend):
```bash
cd packages/client
bun install
bun run dev
# → http://localhost:5173
```

**Server** (backend):
```bash
cd packages/server
cargo run
```

## Development

### Client Commands

```bash
cd packages/client

bun run dev              # Start dev server
bun run build            # Build for production
bun run lint             # Run ESLint
bun run format           # Format with Prettier
bun test                 # Run tests
bun test --coverage      # Run with coverage
```

See [`packages/client/README.md`](packages/client/README.md) for detailed documentation.

### Server Commands

```bash
cd packages/server

cargo run                # Run server
cargo build --release    # Build optimized
cargo test               # Run tests
cargo fmt                # Format code
cargo clippy             # Run linter
cargo audit              # Security scan
cargo deny check         # Check licenses & policies
```

See [`packages/server/README.md`](packages/server/README.md) for detailed documentation.

## Project Structure

```
alle/
├── packages/
│   ├── client/          # React + TypeScript frontend
│   └── server/          # Rust backend
├── docs/                # Documentation
├── .github/workflows/   # CI/CD
│   ├── client-ci.yml    # Client CI pipeline
│   └── server-ci.yml    # Server CI pipeline
├── LICENSE              # GPL-3.0
├── CLAUDE.md           # AI development guidance
└── README.md
```

## CI/CD

GitHub Actions runs on push/PR to `main`, `dev`, `test`:

**Client CI** (5 jobs):
1. Code Quality - Format, lint, type-check
2. Test & Coverage - Run tests with coverage reports
3. Build - Production bundle
4. Security Scan - Dependency audit + Trivy
5. Bundle Analysis - Size tracking (main only)

**Server CI** (runs on push/PR to `main`):
- Build with `cargo build --verbose`
- Test with `cargo test --verbose`

## Git Workflow

- **main** - Production branch (active development)
- **dev** - Development integration
- **test** - Pre-production QA
- **stable/\<date\>** - Production releases
- **feature/**, **fix/**, **refactor/**, **hotfix/** - Topic branches

Currently in early development phase working primarily on `main`.

## Testing

**Client**: Vitest + React Testing Library (jsdom environment)
**Server**: Rust's built-in test framework + Tokio async tests

```bash
# Run all tests
cd packages/client && bun test
cd packages/server && cargo test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Make your changes
4. Run tests and linters
5. Commit changes (`git commit -m 'Add feature'`)
6. Push to branch (`git push origin feature/name`)
7. Open a Pull Request

## License

**GPL-3.0-or-later** - See [LICENSE](LICENSE) file.

This is free and open-source software. You can use, modify, and distribute it freely. If you distribute modified versions, you must:
- Share the source code
- License under GPL-3.0
- Document changes
- Include copyright notices

Learn more: [GNU GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)

## Acknowledgments

Inspired by [Teuxdeux](https://teuxdeux.com).

## Disclaimer

Use at your own risk and accept and all consequences