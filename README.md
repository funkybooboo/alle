# Alle

An open-source minimalist to-do list and planning app inspired by Teuxdeux, focused on simplicity and visual clarity.

## Overview

Alle is a clean, intuitive task management application designed for people who want to stay organized without complexity. Built with modern web technologies, it features drag-and-drop task organization, automatic task rollover, and offline functionality.

## Features

- Clean dashboard with drag-and-drop task organization
- Automatic task rollover for incomplete tasks
- Recurring to-dos
- Someday lists for long-term planning
- Offline functionality
- Markdown and emoji support

For a complete feature list and design principles, see [`docs/high-level-idea.md`](docs/high-level-idea.md).

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and dev server
- **Vitest** for testing
- **Bun** as runtime and package manager

### Backend
- **Rust** (2024 edition)
- **Tokio** async runtime

## Getting Started

### Prerequisites

- **Bun** (latest version) - [Install Bun](https://bun.sh)
- **Rust** (latest stable) - [Install Rust](https://rustup.rs)

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/alle.git
cd alle
```

### Running the Client

```bash
cd packages/client

# Install dependencies
bun install

# Start development server
bun run dev
```

The client will be available at `http://localhost:5173` (default Vite port).

### Running the Server

```bash
cd packages/server

# Build and run the server
cargo run

# Or run in release mode for better performance
cargo run --release
```

## Development

### Client Development

```bash
cd packages/client

# Run linter
bun run lint

# Run tests
bun test

# Build for production
bun run build

# Preview production build
bun run preview
```

### Server Development

```bash
cd packages/server

# Build the server
cargo build

# Run tests
cargo test

# Run tests with verbose output
cargo test --verbose
```

## Testing

### Client Tests
- Framework: **Vitest** with React Testing Library
- Test files: `*.test.tsx` or `*.test.ts`
- Setup: `src/setupTests.ts` includes jest-dom matchers
- Globals enabled (no need to import `test`, `describe`, `expect`)

### Server Tests
- Framework: Rust's built-in test framework
- Async tests: Use `#[tokio::test]` attribute
- Test modules: `#[cfg(test)] mod tests { ... }`

## Project Structure

```
alle/
├── packages/
│   ├── client/          # React frontend
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── server/          # Rust backend
│       ├── src/
│       └── Cargo.toml
├── docs/                # Documentation
├── .github/
│   └── workflows/       # CI/CD workflows
├── CLAUDE.md           # AI assistant guidance
└── README.md
```

## Git Workflow

The project uses a multi-branch workflow:

- **stable/\<date\>**: Production-validated releases (e.g., `stable/2025-10-21`)
- **main**: Production branch, currently the active development branch
- **test**: Pre-production testing/QA branch
- **dev**: Development integration branch
- **feature/**, **fix/**, **refactor/**: Topic branches
- **hotfix/**: Critical bug fixes

During the early development phase, work is primarily done on `main`.

## CI/CD

GitHub Actions workflows run on push and pull requests to `main`:

- **Client CI**: Installs Bun, runs linting and tests
- **Server CI**: Sets up Rust toolchain, builds and runs tests

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

### What does this mean?

Alle is free and open-source software. You can:
- Use it freely for any purpose
- Study and modify the source code
- Distribute copies of the software
- Distribute modified versions

**Important**: If you distribute Alle or modified versions of it, you must:
- Make the source code available
- License it under GPL-3.0
- State any changes you made
- Include copyright and license notices

For more details, visit the [GNU GPL-3.0 page](https://www.gnu.org/licenses/gpl-3.0.en.html).

## Acknowledgments

Inspired by [Teuxdeux](https://teuxdeux.com), the original minimalist to-do app. 
