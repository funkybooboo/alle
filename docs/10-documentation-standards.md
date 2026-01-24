# Documentation Standards

This document defines the documentation writing guidelines, structure, and best practices for the Alle project. These standards are **MANDATORY** for all project documentation.

## Philosophy

Our documentation approach prioritizes:

- **Plain text in Git** — version controlled, reviewable, searchable
- **Dual perspective** — both user and developer viewpoints
- **Living documentation** — updated with code changes
- **Self-service** — enables independent problem-solving
- **Clarity over cleverness** — simple, direct language

---

## Why Plain Text Documentation in Git?

**RULE**: ALL documentation MUST be plain text (Markdown) stored in the Git repository.

### Benefits

1. **Version Control**
   - Track changes over time
   - See who changed what and why
   - Revert incorrect changes
   - Branch documentation with code

2. **Code Review Integration**
   - Documentation changes reviewed in pull requests
   - Enforce documentation updates with code changes
   - Catch documentation errors before merge

3. **Universal Accessibility**
   - Read with any text editor
   - Search with grep, ripgrep, or IDE search
   - No special tools required
   - Works offline

4. **Automation Friendly**
   - Generate docs from source files
   - Lint and validate in CI
   - Build static sites automatically
   - Extract metrics and reports

5. **Future-Proof**
   - Plain text survives tool changes
   - No vendor lock-in
   - Readable decades from now
   - Easy to migrate

❌ **NEVER**:
- Store docs in Google Docs, Notion, or other external tools
- Use proprietary formats (.docx, .pages)
- Keep docs separate from code repository
- Rely on wikis that aren't version controlled

✅ **ALWAYS**:
- Write docs in Markdown (.md files)
- Store docs in Git repository
- Update docs in same PR as code changes
- Review docs with same rigor as code

---

## Directory Structure

**RULE**: Documentation MUST be organized in this directory structure:

```
alle/
├── docs/                      # Technical documentation
│   ├── 00-table-of-contents.md
│   ├── 01-introduction.md
│   ├── 02-getting-started.md
│   ├── 03-architecture.md
│   ├── 04-code-standards.md
│   ├── 05-testing.md
│   ├── 06-contributing.md
│   ├── 07-testing-philosophy.md
│   ├── 08-design-patterns.md
│   ├── ... (numbered docs)
│   ├── user/                  # End-user documentation
│   │   ├── getting-started.md
│   │   ├── features/
│   │   └── troubleshooting.md
│   ├── developer/             # Developer guides
│   │   ├── setup.md
│   │   ├── architecture/
│   │   └── api-reference/
│   └── diagrams/              # Mermaid diagrams
│       ├── architecture.md
│       └── flows.md
│
├── planning/                  # Project planning
│   ├── roadmap.md
│   ├── user-stories/          # User stories
│   │   ├── US-001-...md
│   │   └── US-002-...md
│   ├── technical-specs/       # Technical specifications
│   │   └── US-001-spec.md
│   ├── decisions/             # Architecture Decision Records
│   │   ├── ADR-001-...md
│   │   └── ADR-002-...md
│   └── retrospectives/        # Sprint retrospectives
│       └── 2024-01.md
│
└── .ai-agents/                # AI agent prompts for CI
    ├── security-agent.md
    └── ...
```

---

## Dual-Perspective Documentation

**RULE**: Feature documentation MUST provide both user and developer perspectives.

### User Perspective

**FOCUS**: How to use the feature to accomplish goals.

**AUDIENCE**: End users, non-technical stakeholders.

**CONTENT**:
- What the feature does
- Why it's useful
- Step-by-step instructions
- Screenshots and examples
- Common problems and solutions
- Keyboard shortcuts and tips

**EXAMPLE** (`docs/user/task-filtering.md`):
```markdown
# Filtering Tasks by Date

Filter your tasks to focus on what matters most.

## Why Use Date Filtering?

When you have many tasks, date filtering helps you:
- Focus on upcoming deadlines
- Plan your week efficiently
- Reduce overwhelm from long task lists

## How to Filter Tasks

1. Click the **Filter** button above your task list
2. Select **Filter by Date**
3. Choose your start date
4. Choose your end date
5. Click **Apply**

Your task list now shows only tasks in your selected date range.

## Tips

- Your filter is saved automatically
- Press `Alt+F` to quickly open filters
- Press `Esc` to close the filter panel
- On mobile, swipe right to open filters

## Troubleshooting

**Problem**: Filter button is grayed out
**Solution**: You need at least one task to use filters

**Problem**: No tasks appear after filtering
**Solution**: Check your date range — you might not have tasks in that period
```

### Developer Perspective

**FOCUS**: How the feature is implemented and integrated.

**AUDIENCE**: Developers, maintainers, contributors.

**CONTENT**:
- Architecture and design decisions
- API endpoints and schemas
- Database changes
- Component hierarchy
- Integration points
- Edge cases and error handling
- Testing strategy
- Performance considerations

**EXAMPLE** (`docs/developer/task-filtering.md`):
```markdown
# Task Filtering Implementation

## Architecture

The date filtering feature uses:
- Client-side: `DateRangeFilter` React component
- API: Query parameters on `GET /api/tasks`
- Database: Compound index on `(user_id, date)`
- State: LocalStorage for filter persistence

## API Endpoint

### Request
```
GET /api/tasks?startDate=2024-01-01&endDate=2024-01-31
```

### Response
```json
{
  "data": {
    "tasks": [...],
    "total": 245,
    "filtered": 42
  }
}
```

## Database Query

```sql
SELECT * FROM tasks
WHERE user_id = $1
  AND date >= $2
  AND date <= $3
ORDER BY date ASC, created_at ASC;
```

## Components

- `DateRangeFilter` — Container component
- `DatePicker` — Date input with calendar
- `FilterButton` — Apply/Clear actions

## State Management

Filter state stored in:
1. React state (UI)
2. URL query params (shareable links)
3. LocalStorage (persistence)

## Edge Cases

- Invalid date formats return 400
- Start > end date returns 400
- Missing dates query all tasks
- Empty results show helpful message

## Testing

- Unit: `dateUtils.test.ts`
- Integration: `task-filter-api.test.ts`
- E2E: `date-filter.spec.ts`
- Storybook: `DatePicker.stories.ts`
```

---

## Markdown Standards

**RULE**: All Markdown files MUST follow these standards.

### Headers

Use ATX-style headers (# ## ###):

✅ **GOOD**:
```markdown
# Main Title
## Section
### Subsection
```

❌ **BAD**:
```markdown
Main Title
==========
Section
-------
```

**RULES**:
- H1 (#) — Document title (exactly one per file)
- H2 (##) — Major sections
- H3 (###) — Subsections
- H4 (####) — Rarely used
- Never skip header levels (don't go from H2 to H4)

### Lists

Use dash (-) for unordered lists, 2-space indent for nesting:

✅ **GOOD**:
```markdown
- First item
- Second item
  - Nested item
  - Another nested item
- Third item
```

❌ **BAD**:
```markdown
* First item
+ Second item
    - Nested (wrong indent)
```

### Code Blocks

Always specify language for syntax highlighting:

✅ **GOOD**:
````markdown
```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```
````

❌ **BAD**:
````markdown
```
function greet(name) {
  return "Hello, " + name;
}
```
````

### Links

Use reference-style for repeated links:

✅ **GOOD**:
```markdown
See the [API documentation][api-docs] for details.
Check the [API documentation][api-docs] reference.

[api-docs]: ./api/endpoints.md
```

### Line Length

**SOFT LIMIT**: 100 characters per line.

**EXCEPTIONS**:
- Long URLs
- Code blocks
- Tables

### Emphasis

- **Bold** for strong emphasis (`**bold**`)
- *Italic* for mild emphasis (`*italic*`)
- `Code` for technical terms (`` `code` ``)

### Horizontal Rules

Use three hyphens for section breaks:

```markdown
---
```

---

## User Story Documentation

**RULE**: Every user story MUST be documented with acceptance criteria mapped to E2E tests.

### User Story Template

```markdown
# US-{number}: {Title}

## User Story

**As a** {role}
**I want** {feature}
**So that** {benefit}

## Business Context

{Why this feature matters, expected impact}

## Acceptance Criteria

### AC1: {Name}
**Given** {precondition}
**When** {action}
**Then** {expected result}
**And** {additional expectation}

### AC2: {Name}
...

## Business Rules

- BR1: {Rule description}
- BR2: {Rule description}

## E2E Test Mapping

| AC | Test File | Test Method | Status |
|----|-----------|-------------|--------|
| AC1 | date-filter.spec.ts | shows date range selector | ✅ |
| AC2 | date-filter.spec.ts | filters tasks by date | ✅ |
| AC3 | date-filter.spec.ts | clears filter | ✅ |
| AC4 | date-filter.spec.ts | persists filter | ✅ |

## API Requirements

{API endpoints needed}

## Non-Functional Requirements

- NFR1: Performance requirements
- NFR2: Accessibility requirements
- NFR3: Browser compatibility

## Definition of Done

- [ ] All ACs pass E2E tests
- [ ] Unit test coverage ≥ 90%
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Deployed to production
```

---

## JSDoc Standards for Code

**RULE**: All public APIs MUST have JSDoc comments.

### Functions

```typescript
/**
 * Calculates the final price after applying discounts.
 *
 * Applies student discount (10%) if user is verified student.
 * Applies bulk discount (15%) if quantity > 10.
 * Discounts are not stackable.
 *
 * @param basePrice - The original price before discounts
 * @param user - User object containing type and verification status
 * @param quantity - Number of items being purchased
 * @returns Final price after applicable discount
 * @throws {ValidationError} If basePrice is negative
 *
 * @example
 * ```typescript
 * const price = calculateFinalPrice(100, { type: 'student', verified: true }, 1);
 * // Returns 90 (10% student discount applied)
 * ```
 */
export function calculateFinalPrice(
  basePrice: number,
  user: User,
  quantity: number
): number {
  // Implementation...
}
```

### Classes

```typescript
/**
 * Manages task persistence and retrieval.
 *
 * Stores tasks in memory with optional date filtering.
 * All tasks are sorted by date, then creation time.
 *
 * @example
 * ```typescript
 * const repository = new InMemoryTaskRepository(dateProvider);
 * const task = await repository.save({ text: 'Buy groceries', date: '2024-01-15' });
 * const tasks = await repository.findAll();
 * ```
 */
export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();

  /**
   * Creates a new task repository instance.
   *
   * @param dateProvider - Provider for generating timestamps
   */
  constructor(private dateProvider: DateProvider) {}

  // Methods...
}
```

### Interfaces

```typescript
/**
 * Defines contract for task data persistence.
 *
 * Implementations must handle all CRUD operations and
 * ensure data consistency.
 */
export interface TaskRepository {
  /**
   * Finds a task by its unique identifier.
   *
   * @param id - Task UUID
   * @returns Task if found, null otherwise
   */
  findById(id: string): Promise<Task | null>;

  // Other methods...
}
```

---

## Architecture Decision Records (ADRs)

**RULE**: Significant architectural decisions MUST be documented as ADRs.

**LOCATION**: `planning/decisions/ADR-{number}-{title}.md`

### ADR Template

```markdown
# ADR-005: Use Bun Test Runner Instead of Jest

## Status

Accepted

## Context

We need a test framework for our TypeScript project. Options:
- Jest (industry standard, mature ecosystem)
- Vitest (modern, fast, Vite-compatible)
- Bun test runner (native to Bun runtime)

## Decision

We will use Bun's built-in test runner.

## Rationale

- **Performance**: 10x faster than Jest in our benchmarks
- **Zero Configuration**: Works out of the box with Bun projects
- **TypeScript Support**: Native, no additional setup
- **Jest Compatibility**: Familiar API for team members
- **Simplicity**: Fewer dependencies to manage
- **Future-Proof**: Maintained by Bun core team

## Consequences

### Positive
- Faster test execution (< 1s for full suite)
- Simpler tooling setup
- Better TypeScript integration
- Less maintenance overhead

### Negative
- Smaller ecosystem than Jest
- Fewer plugins available
- Team must learn new tool (minimal, API is similar)

### Neutral
- Migration from Jest possible if needed
- Can run both Jest and Bun tests during transition

## Alternatives Considered

1. **Jest**: Mature but slower, requires additional config
2. **Vitest**: Fast but adds Vite dependency

## References

- Bun test documentation: https://bun.sh/docs/cli/test
- Performance benchmark: planning/benchmarks/test-runners.md
- Team discussion: #123 (GitHub issue)
```

---

## Documentation Linting

**RULE**: All Markdown files MUST pass linting checks.

### Markdownlint Configuration

Use markdownlint to enforce standards:

```json
{
  "MD001": true,
  "MD003": { "style": "atx" },
  "MD004": { "style": "dash" },
  "MD007": { "indent": 2 },
  "MD013": { "line_length": 100 },
  "MD024": { "allow_different_nesting": true },
  "MD025": true,
  "MD026": true,
  "MD029": { "style": "ordered" },
  "MD033": false,
  "MD041": true
}
```

### Running Linter

```bash
# Check all docs
markdownlint docs/**/*.md

# Fix auto-fixable issues
markdownlint --fix docs/**/*.md

# In CI pipeline (fail on errors)
markdownlint --config .markdownlint.json docs/**/*.md
```

---

## Documentation Quality Checklist

Before merging documentation:

- [ ] Follows directory structure
- [ ] Uses correct header hierarchy (H1 → H2 → H3)
- [ ] Code blocks specify language
- [ ] Line length ≤ 100 chars (where reasonable)
- [ ] No spelling errors
- [ ] Links are valid (use link checker)
- [ ] Examples are tested and accurate
- [ ] JSDoc comments on all public APIs
- [ ] User and developer perspectives provided (for features)
- [ ] Passes markdownlint checks
- [ ] Reviewed like code (in PR)

---

## Summary

Quality documentation is as important as quality code. Invest in clear, accurate, well-organized documentation to enable team scalability and user success.
