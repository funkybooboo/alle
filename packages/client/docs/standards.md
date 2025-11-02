# Client Coding Standards

React + TypeScript + Tailwind CSS standards for the Alle frontend.

## Core Principles

- **Framework Agnostic**: Keep business logic outside components; use plain JS/TS functions
- **Small Components**: Single responsibility, composable, reusable
- **Dependency Injection**: Inject dependencies for testability
- **Always Test**: Co-locate tests; 80%+ coverage for critical components
- **Minimize Mocks**: Use real implementations; only mock external APIs

## TypeScript

### Standards

- **Strict Mode**: Always enabled
- **No `any`**: Use `unknown` or proper types
- **Type Inference**: For local variables; explicit for function signatures

### Naming

- **Components**: PascalCase (`TodoList`, `Button`)
- **Functions**: camelCase (`handleSubmit`, `fetchTodos`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`TodoItemProps`, `UserData`)

### Code Organization

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/shared/components';

// 2. Types
interface TodoListProps {
  items: Todo[];
}

// 3. Business logic (outside component)
function filterCompletedTodos(todos: Todo[]): Todo[] {
  return todos.filter(t => t.completed);
}

// 4. Component
export function TodoList({ items }: TodoListProps) {
  // Component logic
}
```

## React

### Components

- **Functional Components**: Always use hooks
- **Props**: Define interface; use default parameters
- **Hooks**: Prefix with "use"; complete dependency arrays
- **Event Handlers**: Prefix with "handle"; extract complex logic

### Custom Hooks

```typescript
function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos().then(setTodos).finally(() => setLoading(false));
  }, []);

  return { todos, loading, setTodos };
}
```

## Styling

- **Tailwind**: For standard CSS (layout, spacing, typography, colors)
- **Custom CSS**: For complex animations and unique effects
- **CSS Modules**: For component-scoped styles
- **Avoid Inline Styles**: Prefer classes

```typescript
// Tailwind for standard styling
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>
```

## Testing

### Structure

```typescript
describe('TodoList', () => {
  it('renders empty state when no todos provided', () => {
    render(<TodoList todos={[]} />);
    expect(screen.getByText('No todos yet')).toBeInTheDocument();
  });
});
```

### Best Practices

- **Test User Behavior**: From user's perspective
- **Query Priority**: `getByRole`, `getByLabelText` over `getByTestId`
- **Minimize Mocks**: Use real implementations; inject test services

```typescript
// Good: Real implementation
const testService = new InMemoryTodoService([
  { id: '1', title: 'Test', completed: false }
]);
render(<TodoList todoService={testService} />);

// Bad: Over-mocking
const mockService = { fetchTodos: vi.fn().mockResolvedValue([...]) };
```

### Storybook

- **Visual Testing**: Develop components in isolation
- **All States**: Create stories for loading, error, empty, success states
- **Co-located**: Place `.stories.tsx` next to components
- **Interaction Tests**: Use play function
- **Accessibility**: Use a11y addon

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Click me' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};
```

## Architecture: Recursive Component Structure

**Each component folder contains all related files:**

```
src/components/calendar/task-item/
├── TaskItem.tsx             # Component implementation
├── TaskItem.types.ts        # TypeScript interfaces
├── TaskItem.test.tsx        # Unit tests
└── TaskItem.stories.tsx     # Storybook stories (optional)
```

**Components nest recursively:**

```
src/
├── components/
│   └── calendar/            # Feature area
│       ├── calendar-view/   # Parent component
│       │   ├── CalendarView.tsx
│       │   ├── CalendarView.types.ts
│       │   └── CalendarView.test.tsx
│       ├── day-column/      # Child component
│       │   ├── DayColumn.tsx
│       │   ├── DayColumn.types.ts
│       │   └── DayColumn.test.tsx
│       └── task-item/       # Nested child
│           ├── TaskItem.tsx
│           ├── TaskItem.types.ts
│           ├── TaskItem.test.tsx
│           └── TaskItem.stories.tsx
├── api/                     # API clients (task-api.ts, etc.)
├── pages/                   # Page components (Home.tsx, etc.)
├── tests/
│   ├── fixtures/            # Mock data
│   ├── mocks/               # MSW handlers
│   └── system/              # System tests
└── main.tsx
```

### Benefits

- **Co-location**: All component files together
- **Clear hierarchy**: Parent/child relationships visible in folder structure
- **Easy refactoring**: Move/delete entire component folders
- **Self-documenting**: Structure shows component relationships
- **Testability**: Tests co-located with components

### Import Rules

```typescript
// ✅ Good: Import from component folder
import { TaskItem } from '../components/calendar/task-item/TaskItem';
import type { TaskItemProps } from '../components/calendar/task-item/TaskItem.types';

// ✅ Good: Relative imports within same feature
import { DayColumn } from '../day-column/DayColumn';

// ❌ Bad: Deep imports (use full paths)
import { TaskItem } from '../../../task-item/TaskItem';
```

## Performance

- **Code Splitting**: `React.lazy()` for routes
- **Memoization**: `useMemo`, `useCallback` for expensive operations
- **Virtual Lists**: For long lists
- **Lazy Loading**: Images and heavy components

## Accessibility

- **Semantic HTML**: Use appropriate elements
- **ARIA Labels**: When semantic HTML isn't enough
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Manage focus appropriately

```typescript
<button
  aria-label="Mark todo as complete"
  onClick={handleComplete}
  className="p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
>
  <CheckIcon />
</button>
```

## Reference Standards

- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
