# Alle

Minimalist to-do list app inspired by Teuxdeux. Simple task management focused on getting things done.

**Features:** Drag-and-drop, automatic rollover, recurring tasks, offline mode, markdown support

See [`docs/high-level-idea.md`](docs/high-level-idea.md) for details.

## Tech Stack

**Frontend:** React 19 + TypeScript + Vite + Bun
**Backend:** Rust + Tokio async runtime

## Quick Start

```bash
# Install prerequisites
curl -fsSL https://bun.sh/install | bash  # Bun
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh  # Rust

# Client
cd packages/client && bun install && bun run dev  # → http://localhost:5173

# Server (separate terminal)
cd packages/server && cargo run
```

## Development

**Client:** `bun run dev` | `bun run build` | `bun run lint` | `bun test`
**Server:** `cargo run` | `cargo test` | `cargo fmt` | `cargo clippy`

See package READMEs for details: [`client`](packages/client/README.md) | [`server`](packages/server/README.md)

## Structure

```
packages/client/   # React frontend
packages/server/   # Rust backend
.github/workflows/ # CI/CD pipelines
```

## CI/CD

GitHub Actions on push/PR to `main`, `dev`, `test`:
- **Client:** Quality checks, tests, build, security scan
- **Server:** Build, tests

## Git Workflow

**main** (production) → **dev** → **test** → **stable/\<date\>** releases
Topic branches: `feature/`, `fix/`, `refactor/`, `hotfix/`

## Testing

**Client:** Vitest + React Testing Library — **Server:** Cargo + Tokio

```bash
cd packages/client && bun test
cd packages/server && cargo test
```

## Contributing

1. Fork → create branch → make changes → test/lint
2. Commit → push → open PR

## License

**GPL-3.0-or-later** — Free to use, modify, and distribute. Modified versions must share source code under GPL-3.0. See [LICENSE](LICENSE).

Inspired by [Teuxdeux](https://teuxdeux.com).
