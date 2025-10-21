# CI/CD Workflows

## Workflows

**client-ci.yml** - Runs on push/PR to `main`, `dev`, `test` (when client files change)
- **Quality**: Format check, lint, type-check
- **Test**: Run tests
- **Build**: Production bundle

**server-ci.yml** - Runs on push/PR to `main`, `dev`, `test` (when server files change)
- **Quality**: Format check, clippy
- **Test**: Run tests
- **Build**: Release build

Both workflows run 3 jobs in parallel with automatic caching.

## Testing Locally with act

**Install:**
```bash
# Linux
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# macOS
brew install act

# Windows
choco install act-cli
```

**Usage:**
```bash
act -l                                    # List workflows
act -W .github/workflows/client-ci.yml    # Run client CI
act -W .github/workflows/server-ci.yml    # Run server CI
act -j quality                            # Run specific job
act push                                  # Test push event
act -n                                    # Dry run
```

**Note:** Requires Docker. First run downloads ~1-2GB images.

## Testing Without act

**Client:**
```bash
cd packages/client
bun run format:check && bun run lint && bunx tsc --noEmit && bun test run && bun run build
```

**Server:**
```bash
cd packages/server
cargo fmt --check && cargo clippy -- -D warnings && cargo test && cargo build --release
```

## Pre-commit Hook

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
set -e

cd packages/client
bun run format:check && bun run lint && bunx tsc --noEmit && bun test run

cd ../server
cargo fmt --check && cargo clippy -- -D warnings && cargo test

echo "All checks passed!"
```

Make executable: `chmod +x .git/hooks/pre-commit`

## Resources

- [act](https://github.com/nektos/act)
- [GitHub Actions](https://docs.github.com/en/actions)
