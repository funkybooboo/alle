# Alle Client

The React frontend for Alle, a minimalist to-do list and planning application. Built with React 19, TypeScript, and Vite for a fast, modern development experience.

## Overview

The Alle client provides a clean, intuitive interface for task management inspired by Teuxdeux. It's designed for simplicity and visual clarity, with features like drag-and-drop task organization, automatic task rollover, and offline functionality.

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development with strict mode
- **Vite** - Lightning-fast build tool and dev server
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Accessible component testing
- **Bun** - Modern JavaScript runtime and package manager
- **ESLint** - Code quality and consistency

## Getting Started

### Prerequisites

- **Bun** (latest version) - [Install Bun](https://bun.sh)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

### Installation

```bash
# Navigate to the client directory
cd packages/client

# Install dependencies
bun install
```

### Running the Development Server

```bash
# Start dev server with Hot Module Replacement (HMR)
bun run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Building for Production

```bash
# Type-check and build optimized bundle
bun run build

# Preview production build locally
bun run preview
```

Build output is generated in the `dist/` directory.

## Development

### Available Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run linter
bun run lint

# Run tests
bun test

# Run tests in watch mode
bun test --watch
```

### Development Workflow

1. **Start the dev server**: `bun run dev`
2. **Make changes**: Edit `.tsx`, `.ts`, or `.css` files
3. **See updates instantly**: Vite HMR updates the browser automatically
4. **Run tests**: `bun test` to verify functionality
5. **Lint code**: `bun run lint` before committing

### Hot Module Replacement (HMR)

Vite provides fast HMR for React components:
- Edit a component and see changes instantly
- State is preserved when possible
- Full page reload only when necessary
- CSS updates without page reload

## Project Structure

```
packages/client/
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config reference
├── tsconfig.app.json       # App-specific TypeScript config
├── tsconfig.node.json      # Node/build tool TypeScript config
├── eslint.config.js        # ESLint configuration
├── package.json            # Dependencies and scripts
├── bun.lock               # Dependency lock file
├── public/                 # Static assets (served as-is)
│   └── vite.svg
└── src/
    ├── main.tsx            # Application entry point
    ├── App.tsx             # Root component
    ├── App.css             # Component styles
    ├── App.test.tsx        # Component tests
    ├── index.css           # Global styles
    ├── setupTests.ts       # Test configuration
    └── assets/             # Imported assets
        └── react.svg
```

### Expected Future Structure

As the application grows, consider organizing code like this:

```
src/
├── main.tsx
├── App.tsx
├── components/             # Reusable UI components
│   ├── TaskItem/
│   │   ├── TaskItem.tsx
│   │   ├── TaskItem.test.tsx
│   │   └── TaskItem.css
│   ├── TaskList/
│   └── DayColumn/
├── pages/                  # Page-level components
│   ├── Dashboard.tsx
│   ├── SomedayList.tsx
│   └── Settings.tsx
├── hooks/                  # Custom React hooks
│   ├── useTaskManager.ts
│   ├── useLocalStorage.ts
│   └── useOfflineSync.ts
├── contexts/               # React Context providers
│   ├── ThemeContext.tsx
│   ├── UserContext.tsx
│   └── TaskContext.tsx
├── services/               # API and business logic
│   ├── api.ts
│   ├── taskService.ts
│   └── authService.ts
├── types/                  # TypeScript type definitions
│   ├── task.ts
│   ├── user.ts
│   └── api.ts
├── utils/                  # Utility functions
│   ├── dateHelpers.ts
│   ├── formatters.ts
│   └── validators.ts
└── styles/                 # Global styles and themes
    ├── variables.css
    ├── themes.css
    └── animations.css
```

## Testing

The client uses Vitest with React Testing Library for testing.

### Test Configuration

**Setup File:** `src/setupTests.ts`
```typescript
import '@testing-library/jest-dom';
```

**Vite Config:** Tests configured in `vite.config.ts`
```typescript
test: {
  globals: true,              // No need to import test, describe, expect
  environment: 'jsdom',       // Browser DOM simulation
  setupFiles: './src/setupTests.ts',
}
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/App.test.tsx
```

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

**Testing Best Practices:**
- Use `@testing-library/react` for accessible queries
- Test user behavior, not implementation details
- Use `screen.getByRole` for accessibility-focused testing
- Mock API calls in tests
- Keep tests focused and descriptive

### Jest-DOM Matchers

Available through `@testing-library/jest-dom`:
- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toBeVisible()`
- `toBeDisabled()`
- `toHaveClass()`
- And more...

## TypeScript Configuration

### App TypeScript (tsconfig.app.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable", "vitest/globals"],
    "module": "ESNext",
    "jsx": "react-jsx",           // React 17+ automatic JSX
    "strict": true,               // Strict type checking
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "moduleResolution": "bundler"
  }
}
```

**Key Features:**
- Strict mode enabled for type safety
- Modern ES2022 features
- Automatic JSX transform (no need to import React)
- Bundler module resolution for Vite

## Styling

### CSS Architecture

The project uses plain CSS with modern features:

**Global Styles** (`src/index.css`):
- CSS custom properties (variables)
- System font stack
- Light/dark mode support via `color-scheme`
- Media query for `prefers-color-scheme`
- Global typography and button styles

**Component Styles** (`src/App.css`):
- Component-scoped styles
- Animations with accessibility support
- `prefers-reduced-motion` media query support

### Dark Mode Support

Automatic dark mode based on system preferences:

```css
:root {
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode colors */
  }
}
```

### Planned Styling Approach

As the app grows, consider:
- **CSS Modules**: Scoped styles per component
- **Tailwind CSS**: Utility-first CSS framework
- **CSS-in-JS**: styled-components or emotion
- **Theme System**: Consistent colors, spacing, typography

## Linting

### ESLint Configuration

The project uses modern flat config format (`eslint.config.js`):

**Enabled Rules:**
- ESLint recommended rules
- TypeScript ESLint rules
- React Hooks rules (enforce hooks best practices)
- React Refresh rules (ensure HMR compatibility)

**Running the Linter:**
```bash
# Check for linting errors
bun run lint

# Fix auto-fixable issues (when available)
bun run lint --fix
```

### Expanding ESLint Configuration

For production applications, enable type-aware linting:

```js
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // Or for stricter rules:
      tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

## Dependencies

### Production Dependencies

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1"
}
```

### Development Dependencies

| Category | Package | Purpose |
|----------|---------|---------|
| **Build** | `vite` | Build tool and dev server |
| | `@vitejs/plugin-react` | React support with Fast Refresh |
| **TypeScript** | `typescript` | TypeScript compiler |
| | `@types/react` | React type definitions |
| | `@types/react-dom` | React DOM type definitions |
| | `@types/node` | Node.js type definitions |
| **Testing** | `vitest` | Test framework |
| | `@testing-library/react` | React testing utilities |
| | `@testing-library/jest-dom` | DOM matchers |
| | `jsdom` | DOM implementation |
| **Linting** | `eslint` | Code linter |
| | `@eslint/js` | ESLint base config |
| | `typescript-eslint` | TypeScript ESLint |
| | `eslint-plugin-react-hooks` | React Hooks rules |
| | `eslint-plugin-react-refresh` | HMR rules |

### Future Dependencies

Consider adding these as features are developed:

**Routing:**
```bash
bun add react-router-dom
```

**HTTP Client:**
```bash
bun add axios
# or use native fetch with a wrapper
```

**State Management:**
```bash
bun add zustand
# or redux, jotai, etc.
```

**Drag & Drop:**
```bash
bun add @dnd-kit/core @dnd-kit/sortable
# or react-beautiful-dnd
```

**Date Handling:**
```bash
bun add date-fns
# or dayjs
```

**Form Handling:**
```bash
bun add react-hook-form zod
```

**UI Components:**
```bash
bun add @radix-ui/react-*
# or headlessui
```

## Vite Configuration

**Vite Plugins:**
- `@vitejs/plugin-react` - React Fast Refresh and JSX support

**Development Server:**
- Default port: 5173
- HMR enabled
- Fast cold start and updates

**Build Optimization:**
- Code splitting
- Tree shaking
- Minification
- Asset optimization

**Custom Configuration:**
Edit `vite.config.ts` to customize:
- Server port and host
- Build output directory
- Asset handling
- Proxy API requests

## CI/CD

The client is integrated with GitHub Actions for continuous integration:

**Workflow** (`.github/workflows/client.yml`):
- Runs on push and pull requests to `main`
- Installs Bun runtime
- Runs `bun install`
- Runs `bun run lint` (ESLint check)
- Runs `bun test` (Vitest tests)

### Pre-Commit Checklist

Before committing, ensure:
```bash
# Lint passes
bun run lint

# Tests pass
bun test

# Build succeeds
bun run build

# Type-check passes (included in build)
tsc -b
```

## Environment Variables

Vite supports environment variables with the `VITE_` prefix:

**Create `.env` files:**
```bash
# .env.local (not committed)
VITE_API_URL=http://localhost:8080/api
VITE_ENABLE_ANALYTICS=false
```

**Access in code:**
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Environment files:**
- `.env` - All environments
- `.env.local` - Local overrides (gitignored)
- `.env.development` - Development only
- `.env.production` - Production only

## Performance Considerations

### React 19 Features

The app uses React 19 with:
- **Concurrent rendering** - Better responsiveness
- **Automatic batching** - Fewer re-renders
- **Transitions** - Non-blocking updates
- **React Server Components** - Ready when needed

### Optimization Tips

- Use `React.memo()` for expensive components
- Implement `useMemo()` and `useCallback()` for expensive calculations
- Code split with `React.lazy()` and `Suspense`
- Optimize images (WebP, lazy loading)
- Keep bundle size small (analyze with `vite-bundle-visualizer`)

## Browser Support

Targets modern browsers with ES2022 support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Adjust `tsconfig.app.json` `target` for different browser support.

## Accessibility

**Best Practices:**
- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast ratios
- Support reduced motion preferences

**Testing Library:** React Testing Library encourages accessible component queries by default.

## Contributing

When contributing to the client:

1. Follow React best practices and hooks rules
2. Write tests for new components and features
3. Use TypeScript strictly (no `any` types)
4. Keep components small and focused
5. Document complex logic with comments
6. Ensure accessibility standards
7. Run linter and tests before committing

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Testing Library](https://testing-library.com/react)
- [Bun Documentation](https://bun.sh/docs)
