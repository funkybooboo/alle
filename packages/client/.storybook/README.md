# Storybook Setup

This directory contains Storybook configuration for visual component testing and documentation.

## Running Storybook

```bash
# Start Storybook dev server
npm run storybook

# Build static Storybook
npm run build-storybook
```

Storybook will be available at http://localhost:6006

## Configuration

- **main.ts** - Main Storybook configuration
- **preview.ts** - Global decorators, parameters, and styles
- **vitest.setup.ts** - Vitest integration for component testing

## Writing Stories

Stories should be co-located with components:

```
src/components/MyComponent/
  ├── MyComponent.tsx
  ├── MyComponent.stories.tsx
  └── MyComponent.test.tsx
```

### Story Template

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define arg types here
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const WithCustomProps: Story = {
  args: {
    // Custom props
  },
};
```

## Components Needing Stories

The following new components need Storybook stories:

### Task Detail Components
- [ ] `TaskDetailModal` - Main modal with all tabs
- [ ] `MarkdownEditor` - Live markdown editor
- [ ] `ColorPicker` - Color selection component
- [ ] `TagInput` - Tag management with suggestions
- [ ] `LinksManager` - Link CRUD interface
- [ ] `FileUpload` - File attachment component

### Story Guidelines

1. **Default State** - Show component in default/initial state
2. **Variants** - Show different prop combinations
3. **Interactive** - Allow users to interact with controls
4. **Loading State** - Show loading/skeleton states
5. **Error State** - Show error handling
6. **Edge Cases** - Empty, full, long text, etc.

### Example Stories to Write

#### TaskDetailModal
- Default (with mock task)
- With notes (markdown content)
- With tags
- With links
- With attachments
- Loading state
- Error state

#### MarkdownEditor
- Empty editor
- With content
- Preview mode
- Different markdown features (headers, lists, code, etc.)

#### ColorPicker
- With presets loaded
- Without presets (loading)
- Selected color
- Custom color input

#### TagInput
- Empty
- With existing tags
- With suggestions
- Adding new tag

#### LinksManager
- No links
- With multiple links
- Adding new link
- Editing link

#### FileUpload
- Empty state
- With files
- Uploading state
- Drag over state
- Error state (file too large)

## Addons

The following addons are configured:

- **@storybook/addon-docs** - Automatic documentation
- **@storybook/addon-a11y** - Accessibility testing
- **@storybook/addon-vitest** - Component testing
- **@chromatic-com/storybook** - Visual regression testing

## Best Practices

1. Write stories for all interactive components
2. Use args for dynamic props
3. Add JSDoc comments for documentation
4. Test accessibility with a11y addon
5. Use play functions for interaction testing
6. Keep stories simple and focused
