# Alle Client

React + TypeScript frontend built with Vite and Bun.

## Quick Start

```bash
curl -fsSL https://bun.sh/install | bash  # Install Bun
cd packages/client && bun install && bun run dev  # → http://localhost:5173
```

**Stack:** React 19 • TypeScript • Vite • Vitest • ESLint • Prettier

## Commands

**Dev:** `bun run dev` • `bun run build` • `bun run preview`
**Quality:** `bun run format` • `bun run lint` • `bunx tsc --noEmit`
**Test:** `bun test` • `bun test --coverage`
**Deps:** `bun add <pkg>` • `bun add -d <pkg>` • `bun update`

## Pre-Commit

```bash
bun run format && bun run lint && bun test run  # Quick
bun run format:check && bun run lint && bunx tsc --noEmit && bun run test:ci && bun run build  # Full
```

## Testing

**Config:** Vitest with jsdom, globals enabled, jest-dom matchers
**Utils:** `render()`, `screen`, `getByRole`

```typescript
test('renders heading', () => {
  render(<App />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
});
```

## Structure

```
src/
├── main.tsx         # Entry point
├── App.tsx          # Root component
├── setupTests.ts    # Test configuration
├── components/      # UI components
└── assets/          # Static files
```

**Config:** TypeScript strict mode, ES2022, automatic JSX transform

## CI/CD

GitHub Actions: Quality checks, tests, build, security scan, bundle analysis

## Environment Variables

Use `VITE_` prefix in `.env.local`:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Browser Support

Modern browsers: Chrome/Edge 90+, Firefox 88+, Safari 14+
