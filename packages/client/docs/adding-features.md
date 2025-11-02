# Adding Features - Client

Quick guide for adding new features to the React frontend.

## Component Structure (Recursive)

**Each component lives in its own folder with all related files:**

```
src/components/calendar/task-item/
├── TaskItem.tsx             # Component
├── TaskItem.types.ts        # TypeScript interfaces
├── TaskItem.test.tsx        # Unit tests
└── TaskItem.stories.tsx     # Storybook stories (optional)
```

**Recursive nesting:**
```
src/components/
└── calendar/
    ├── calendar-view/       # Parent component
    │   ├── CalendarView.tsx
    │   ├── CalendarView.types.ts
    │   └── CalendarView.test.tsx
    └── day-column/          # Child component
        ├── DayColumn.tsx
        ├── DayColumn.types.ts
        └── DayColumn.test.tsx
```

**Why recursive?**
- Clear hierarchy (parent/child relationships)
- Easy to find all component files together
- Simple to delete/refactor features
- Self-documenting structure

## Adding a New Component

### 1. Create Component Folder

```bash
cd src/components
mkdir -p feature-name/component-name
cd feature-name/component-name
```

### 2. Create Component (`ComponentName.tsx`)

```typescript
import type { ComponentNameProps } from './ComponentName.types';

export const ComponentName = ({
  prop1,
  prop2,
  className = '',
}: ComponentNameProps) => {
  return (
    <div className={`your-classes ${className}`}>
      {/* Your JSX */}
    </div>
  );
};
```

### 3. Create Types (`ComponentName.types.ts`)

```typescript
export interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  className?: string;
}
```

### 4. Create Test (`ComponentName.test.tsx`)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### 5. Create Story (`ComponentName.stories.tsx` - optional)

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/FeatureName/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prop1: 'Example',
  },
};
```

### 6. Export from Parent

If this is a nested component, export from parent's index:

```typescript
// src/components/feature-name/index.ts
export { ComponentName } from './component-name/ComponentName';
export type { ComponentNameProps } from './component-name/ComponentName.types';
```

## Adding a New Feature

### 1. Plan Structure

```
src/
├── components/your-feature/
├── api/your-feature-api.ts       # API client
├── pages/YourFeature.tsx          # Page component
└── tests/fixtures/your-feature.ts # Test data
```

### 2. Create API Client (if needed)

```typescript
// src/api/your-feature-api.ts
import { gql, GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://localhost:8000/graphql');

const GET_ITEMS = gql`
  query {
    items {
      id
      name
    }
  }
`;

export const yourFeatureAPI = {
  getItems: async () => {
    const data = await client.request(GET_ITEMS);
    return data.items;
  },
};
```

### 3. Create Components (Recursive Structure)

```
src/components/your-feature/
├── your-feature-view/      # Main container
├── item-list/              # Child: list of items
└── item-card/              # Child: individual item
```

### 4. Create Page Component

```typescript
// src/pages/YourFeature.tsx
import { useState, useEffect } from 'react';
import { YourFeatureView } from '../components/your-feature/your-feature-view/YourFeatureView';
import { yourFeatureAPI } from '../api/your-feature-api';

export const YourFeature = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    yourFeatureAPI.getItems()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <YourFeatureView
      items={items}
      loading={loading}
    />
  );
};
```

### 5. Add Route

```typescript
// src/App.tsx
import { YourFeature } from './pages/YourFeature';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/your-feature" element={<YourFeature />} />
    </Routes>
  );
}
```

### 6. Add Tests

```bash
# Unit tests (each component)
src/components/your-feature/**/*.test.tsx

# Integration test (page)
src/pages/YourFeature.integration.test.tsx

# System test (if API testing needed)
src/tests/system/your-feature.system.test.ts

# E2E test (if full workflow needed)
cypress/e2e/your-feature.cy.ts
```

## Testing Your Feature

```bash
# During development (watch mode)
bunx vitest

# Before commit
bun run test:unit && bun run test:integration

# Full validation (backend required)
bun run test:system
bun run test:e2e
```

## Best Practices

### Component Design
- **Single Responsibility** - One component, one job
- **Prop Drilling** - Avoid deep nesting; use context if needed
- **Composition** - Build complex UIs from simple components
- **Naming** - Descriptive names (`TaskItem`, not `Item`)

### File Organization
```typescript
// ✅ Good: Co-located files
src/components/calendar/task-item/
├── TaskItem.tsx
├── TaskItem.types.ts
├── TaskItem.test.tsx
└── TaskItem.stories.tsx

// ❌ Bad: Scattered files
src/components/TaskItem.tsx
src/types/TaskItemTypes.ts
src/tests/TaskItem.test.tsx
```

### TypeScript
```typescript
// ✅ Good: Explicit interfaces
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

// ❌ Bad: Inline types
const TaskItem = ({ task, onToggle }: { task: any; onToggle: any }) => {
  // ...
};
```

### Testing
```typescript
// ✅ Good: Test behavior
it('toggles task when checkbox is clicked', async () => {
  const onToggle = vi.fn();
  render(<TaskItem task={mockTask} onToggle={onToggle} />);

  await user.click(screen.getByRole('checkbox'));

  expect(onToggle).toHaveBeenCalledWith(mockTask.id);
});

// ❌ Bad: Test implementation
it('calls handleClick on click', () => {
  // Testing internal function names
});
```

## Common Patterns

### Data Fetching
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  api.getData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

### Forms
```typescript
const [text, setText] = useState('');

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (text.trim()) {
    onSubmit(text);
    setText('');
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  </form>
);
```

### Conditional Rendering
```typescript
{loading && <Spinner />}
{error && <ErrorMessage error={error} />}
{!loading && !error && <Content data={data} />}
```

## Checklist

Before submitting PR:

- [ ] Component folder created with all files
- [ ] Types defined in `.types.ts`
- [ ] Unit test created and passing
- [ ] Storybook story added (for UI components)
- [ ] Integration test if page component
- [ ] Props documented in types
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Responsive design tested
- [ ] Tests pass: `bun run test:unit && bun run test:integration`

## Examples

See existing components for reference:
- **Simple component**: `src/components/calendar/task-input/`
- **Complex component**: `src/components/calendar/calendar-view/`
- **Page component**: `src/pages/Home.tsx`
- **API client**: `src/api/task-api.ts`
