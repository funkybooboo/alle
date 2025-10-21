# Alle Client

React + TypeScript frontend for Alle, a minimalist to-do list app. Built with Vite and Bun.

## Quick Start

```bash
# Prerequisites: Install Bun from https://bun.sh
curl -fsSL https://bun.sh/install | bash

# Install and run
cd packages/client
bun install
bun run dev
```

App runs at `http://localhost:5173` with Hot Module Replacement (HMR).

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite** - Fast build tool and dev server
- **Vitest** + **React Testing Library** - Testing
- **Bun** - Runtime and package manager
- **ESLint** + **Prettier** - Code quality

## Common Commands

### Development
```bash
bun run dev              # Start dev server with HMR
bun run build            # Type-check and build for production
bun run preview          # Preview production build
```

### Code Quality
```bash
bun run format           # Format code with Prettier
bun run format:check     # Check formatting
bun run lint             # Run ESLint
bunx tsc --noEmit        # Type-check only
```

### Testing
```bash
bun test                 # Run tests in watch mode
bun test --coverage      # Run with coverage report
bun run test:ci          # Run once with coverage (CI mode)
bun test App.test.tsx    # Run specific test file
```

### Dependencies
```bash
bun add package-name           # Add dependency
bun add -d package-name        # Add dev dependency
bun remove package-name        # Remove dependency
bun update                     # Update all dependencies
bun outdated                   # Check for updates
```

## Pre-Commit Checks

**Quick** (minimum required):
```bash
bun run format && bun run lint && bun test run
```

**Full** (before pushing):
```bash
bun run format:check && \
bun run lint && \
bunx tsc --noEmit && \
bun run test:ci && \
bun run build
```

## Testing

### Writing Tests

**Example Component Test:**
```typescript
import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import App from './App';

describe('App', () => {
  test('renders heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });
});
```

**Key Testing Utilities:**
- `render()` - Render components
- `screen` - Query rendered elements
- `@testing-library/jest-dom` - DOM matchers (`.toBeInTheDocument()`, etc.)
- Use `getByRole` for accessible queries

### Test Configuration

Tests configured in `vite.config.ts`:
- **Environment**: jsdom (browser simulation)
- **Globals**: Enabled (`test`, `describe`, `expect` available without imports)
- **Setup**: `src/setupTests.ts` includes jest-dom matchers

## Project Structure

```
packages/client/
├── index.html              # Entry HTML
├── vite.config.ts          # Vite + Vitest config
├── tsconfig.json           # TypeScript config
├── eslint.config.js        # ESLint config
├── package.json            # Scripts and dependencies
├── bun.lockb               # Dependency lock file
├── .prettierrc             # Prettier config
├── .prettierignore         # Prettier ignore patterns
├── public/                 # Static assets
└── src/
    ├── main.tsx            # App entry point
    ├── App.tsx             # Root component
    ├── App.test.tsx        # Component tests
    ├── setupTests.ts       # Test setup
    └── assets/             # Images, fonts, etc.
```

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build + Vitest test config |
| `tsconfig.json` | TypeScript base config |
| `tsconfig.app.json` | App TypeScript settings |
| `tsconfig.node.json` | Build tool TypeScript settings |
| `eslint.config.js` | Linting rules |
| `.prettierrc` | Code formatting rules |
| `package.json` | Scripts and dependencies |
| `bun.lockb` | Locked dependency versions |

## TypeScript

**Strict Mode Enabled:**
- Type-safe development
- No implicit `any`
- Unused locals/parameters checked
- Modern ES2022 features
- Automatic JSX transform (no need to import React)

**Type Check:**
```bash
bunx tsc --noEmit    # Check types without building
```

## Formatting & Linting

### Prettier (Code Formatter)
```bash
bun run format           # Format all files
bun run format:check     # Check if formatted
```

Formats: `.ts`, `.tsx`, `.css`, `.json` files in `src/`

### ESLint (Code Linter)
```bash
bun run lint             # Check for issues
bun run lint --fix       # Auto-fix issues
```

**Enabled Rules:**
- ESLint recommended
- TypeScript ESLint
- React Hooks rules
- React Refresh/HMR rules

## CI/CD

GitHub Actions runs 5 jobs on push/PR (see `.github/workflows/client-ci.yml`):

### 1. Code Quality
- Format check (`bun run format:check`)
- Linting (`bun run lint`)
- Type check (`bunx tsc --noEmit`)

### 2. Test & Coverage
- Run tests with coverage (`bun run test:ci`)
- Upload coverage reports
- Generate coverage summary

### 3. Build
- Build production bundle (`bun run build`)
- Verify `dist/` output
- Upload build artifacts

### 4. Security Scan
- Dependency audit (`bunx audit-ci --moderate`)
- Trivy vulnerability scanner
- Upload results to GitHub Security

### 5. Bundle Analysis (main only)
- Analyze bundle size
- Report file sizes

**Concurrency**: In-progress runs cancelled when new commits pushed.

## Environment Variables

Vite supports env vars with `VITE_` prefix:

**Create `.env.local`** (gitignored):
```bash
VITE_API_URL=http://localhost:8080/api
VITE_ENABLE_ANALYTICS=false
```

**Access in code:**
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Env files:**
- `.env` - All environments
- `.env.local` - Local overrides (not committed)
- `.env.development` - Development only
- `.env.production` - Production only

## Security

### Dependency Auditing
```bash
# Check for vulnerabilities
bunx audit-ci --moderate

# Bun's built-in audit
bun audit
```

### Best Practices
- Keep dependencies updated
- Review security advisories
- Use strict TypeScript
- Validate user input
- Sanitize data before rendering

## Performance

### React 19 Features
- Concurrent rendering
- Automatic batching
- Transitions for non-blocking updates

### Optimization Tips
- Use `React.memo()` for expensive components
- Implement `useMemo()` and `useCallback()`
- Code split with `React.lazy()` and `Suspense`
- Lazy load images
- Analyze bundle size

## Browser Support

Targets modern browsers with ES2022:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Resources

- [React Docs](https://react.dev/)
- [Vite Docs](https://vite.dev/)
- [Vitest Docs](https://vitest.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Testing Library](https://testing-library.com/react)
- [Bun Docs](https://bun.sh/docs)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
