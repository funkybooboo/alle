# Storybook Organization

This directory contains documentation and example stories for the Alle project.

## Structure

```
src/
├── components/
│   └── [component-name]/
│       ├── Component.tsx
│       └── Component.stories.tsx     ← Stories co-located with components
├── layouts/
│   └── [layout-name]/
│       ├── Layout.tsx
│       └── Layout.stories.tsx        ← Stories co-located with layouts
├── pages/
│   └── [page-name]/
│       ├── Page.tsx
│       └── Page.stories.tsx          ← Stories co-located with pages
└── stories/
    └── documentation/
        ├── Introduction.mdx          ← Project introduction
        ├── GettingStarted.mdx        ← Guide for creating stories
        └── examples/                 ← Storybook example components
            ├── Examples.mdx
            ├── Button.tsx
            ├── Button.stories.ts
            ├── Header.tsx
            ├── Header.stories.ts
            ├── Page.tsx
            └── Page.stories.ts
```

## Where to Put Stories

### ✅ DO: Co-locate stories with components

Stories should live next to the components they document:

```
src/components/navbar/
├── Navbar.tsx
├── Navbar.stories.tsx          ← Story file here
├── NavbarIcon.tsx
└── NavbarIcon.stories.tsx      ← Story file here
```

### ❌ DON'T: Put component stories in src/stories/

The `src/stories/` directory is reserved for:
- Documentation (MDX files)
- Examples and guides
- Design system documentation

## Naming Conventions

### Story Titles

Use these patterns in your story files:

```tsx
// For components
title: 'Components/[Category]/[ComponentName]'
// Example: 'Components/Navbar/NavbarIcon'

// For layouts
title: 'Layouts/[LayoutName]'
// Example: 'Layouts/HomeLayout'

// For pages
title: 'Pages/[PageName]'
// Example: 'Pages/Home'

// For documentation
title: 'Documentation/[DocName]'
// Example: 'Documentation/Introduction'
```

### File Names

- Component: `ComponentName.tsx`
- Story: `ComponentName.stories.tsx` (or `.ts` for non-JSX stories)
- Documentation: `DocumentName.mdx`

## Quick Start

See [Getting Started](./documentation/GettingStarted.mdx) for a complete guide on creating stories.

## Running Storybook

```bash
# Start Storybook dev server
bun run storybook

# Build static Storybook
bun run build-storybook
```
