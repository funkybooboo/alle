# Alle Server

Rust backend for Alle, a minimalist to-do list app. Built with Tokio async runtime.

## Quick Start

```bash
# Prerequisites: Install Rust from https://rustup.rs

# Build and run
cargo build
cargo run

# Development
cargo watch -x run    # Auto-reload on changes
```

## Development Tools

```bash
# Install essential tools
cargo install cargo-audit cargo-deny cargo-watch cargo-edit

# Tools included with Rust
rustfmt    # Code formatter
clippy     # Linter
```

## Common Commands

### Build & Run
```bash
cargo build             # Build debug
cargo build --release   # Build optimized
cargo run              # Run debug
cargo check            # Quick compile check
```

### Code Quality
```bash
cargo fmt              # Format code
cargo fmt -- --check   # Check formatting
cargo clippy           # Run linter
cargo clippy -- -D warnings  # Fail on warnings
```

### Testing
```bash
cargo test                      # Run all tests
cargo test test_name            # Run specific test
cargo test -- --nocapture       # Show test output
cargo watch -c -x test          # Auto-test on changes
```

### Dependencies
```bash
cargo add crate-name    # Add dependency
cargo rm crate-name     # Remove dependency
cargo update           # Update dependencies
cargo tree             # Show dependency tree
cargo outdated         # Check for updates
```

### Security
```bash
cargo audit            # Check for vulnerabilities
cargo deny check       # Check licenses and policies
```

### Documentation
```bash
cargo doc --open       # Generate and open docs
```

## Pre-Commit Checks

**Quick** (recommended minimum):
```bash
cargo fmt && cargo clippy -- -D warnings && cargo test
```

**Full** (before pushing):
```bash
cargo fmt --check && \
cargo clippy --all-targets -- -D warnings && \
cargo test --all-targets && \
cargo audit && \
cargo deny check
```

## Configuration Files

| File | Purpose |
|------|---------|
| `Cargo.toml` | Dependencies and metadata |
| `Cargo.lock` | Locked versions (commit this) |
| `.rustfmt.toml` | Formatting rules |
| `clippy.toml` | Linter config |
| `deny.toml` | Security & license policies |

## Security Auditing

### cargo-audit
Scans dependencies for known security vulnerabilities:
```bash
cargo audit              # Check vulnerabilities
cargo audit --update     # Update advisory database
```

### cargo-deny
Enforces dependency policies (licenses, security, sources):
```bash
cargo deny check                 # Run all checks
cargo deny check licenses        # Check licenses only
cargo deny check advisories      # Check security only
```

**License Policy**: Project uses GPL-3.0-or-later. Dependencies must use approved licenses (MIT, Apache-2.0, BSD, ISC, Unicode-3.0). See `deny.toml` for full list.

**Adding Dependencies**: After `cargo add`, run `cargo deny check` to verify compliance.

## Tech Stack

- **Rust 2024** with **Tokio** async runtime
- **Current**: Basic Tokio setup with async tests
- **Planned**: axum/actix-web, PostgreSQL, JWT auth, serde

## CI/CD

GitHub Actions runs on push/PR to `main`:
- Builds with `cargo build --verbose`
- Tests with `cargo test --verbose`

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Tokio Docs](https://tokio.rs/)
- [Cargo Book](https://doc.rust-lang.org/cargo/)
- [Clippy Lints](https://rust-lang.github.io/rust-clippy/)
- [RustSec Advisories](https://rustsec.org/)
- [cargo-deny Docs](https://embarkstudios.github.io/cargo-deny/)
