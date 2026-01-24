# Feature Development Loop

This document defines the complete feature development process from user story to production deployment. This workflow is **MANDATORY** for all feature development.

## Philosophy

Our development approach prioritizes:

- **User value first** — start with user stories and acceptance criteria
- **Test-driven development** — write tests before implementation
- **Incremental delivery** — ship small, complete features
- **Quality gates** — automated validation at every step
- **Continuous deployment** — fast feedback from production

---

## The Complete Loop: 7 Phases

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Story      2. Tests     3. Implement   4. Document     │
│  Definition    (TDD)        (Red-Green-    (Update)        │
│                             Refactor)                       │
│                                                             │
│        ↓           ↓            ↓              ↓            │
│                                                             │
│  5. Code       6. Quality    7. Deploy &                   │
│  Review        Gates         Monitor                       │
│                (CI/CD)                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Story Definition & Planning

**GOAL**: Define what to build and why, with clear success criteria.

### Step 1.1: Create User Story

**LOCATION**: `planning/user-stories/US-{number}.md`

**FORMAT**:
```markdown
# US-247: Filter Tasks by Date Range

## User Story

**As a** busy professional
**I want** to filter my tasks by date range
**So that** I can focus on upcoming deadlines

## Business Context

Users currently see all tasks in one long list, making it hard to
plan their week. Analytics show users with >50 tasks rarely complete
them because they feel overwhelmed.

**Expected Impact**:
- Increase task completion rate by 30%
- Reduce user churn by 15%
- Improve user satisfaction (NPS +10)

## Acceptance Criteria

### AC1: Date Range Selector
**Given** I am viewing my task list
**When** I click the "Filter by Date" button
**Then** I see a date range selector with start and end date inputs

### AC2: Apply Date Filter
**Given** I have selected a date range (e.g., Jan 1 - Jan 7)
**When** I click "Apply Filter"
**Then** I see only tasks with dates within that range
**And** the count shows "Showing 12 of 156 tasks"

### AC3: Clear Filter
**Given** I have an active date filter
**When** I click "Clear Filter"
**Then** I see all tasks again
**And** the date range selector is reset

### AC4: Persist Filter Across Sessions
**Given** I have set a date filter
**When** I refresh the page or log out and back in
**Then** my filter preference is remembered

## Business Rules

- BR1: Date range is inclusive (includes both start and end dates)
- BR2: Start date cannot be after end date
- BR3: Maximum date range is 1 year
- BR4: Filter state is saved to localStorage
- BR5: If no tasks match filter, show empty state with helpful message

## API Requirements

- GET /api/tasks?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
- Response includes filtered tasks + total count
- Return 400 if date format invalid
- Return 400 if start > end date

## Non-Functional Requirements

- NFR1: Filter response time < 200ms for up to 10,000 tasks
- NFR2: Date picker is keyboard accessible (WCAG 2.1 AA)
- NFR3: Works on mobile (touch-friendly date picker)
- NFR4: Supports all modern browsers (Chrome, Firefox, Safari, Edge)

## UI/UX Design

[Link to Figma designs or attach screenshots]

## Definition of Done

- [ ] All acceptance criteria pass E2E tests
- [ ] Unit test coverage ≥ 90% for new code
- [ ] Integration tests for API endpoint
- [ ] Storybook stories for date picker component
- [ ] User and developer documentation updated
- [ ] Accessibility audit passes
- [ ] Performance benchmarks met
- [ ] Code reviewed and approved
- [ ] Deployed to staging and tested
- [ ] Product owner approval received

## Related Stories

- Depends on: US-200 (Task List Refactor)
- Blocks: US-250 (Task Priority Sorting)
- Related to: US-235 (Calendar View)

## Estimated Effort

- Story Points: 8
- Dev Hours: 16-20 hours
- QA Hours: 4-6 hours
```

### Step 1.2: Create Technical Specification

**LOCATION**: `planning/technical-specs/US-247-date-filter.md`

**FORMAT**:
```markdown
# Technical Specification: Date Filter (US-247)

## Architecture Overview

- Client: React component with date picker library
- API: New query parameters on existing GET /api/tasks endpoint
- Database: Add compound index on (user_id, date) for performance

## Component Structure

### Client Components
- `DateRangeFilter` — Main container component
- `DatePicker` — Reusable date input component
- `FilterButton` — Apply/Clear filter buttons

### API Changes
- Modify `GET /api/tasks` handler to accept date range query params
- Add validation for date format and range
- Update TaskRepository to support date filtering

### Database Changes
```sql
CREATE INDEX idx_tasks_user_date ON tasks(user_id, date);
```

## Implementation Plan

### Phase 1: API & Data Layer (Day 1-2)
1. Add date filtering to TaskRepository
2. Update API endpoint handler
3. Add API tests for date filtering
4. Performance test with 10k tasks

### Phase 2: UI Components (Day 3-4)
5. Create DatePicker component with Storybook stories
6. Create DateRangeFilter container
7. Add unit tests for date logic
8. Integrate with existing task list

### Phase 3: Integration & Polish (Day 5)
9. Add E2E tests for all acceptance criteria
10. Add localStorage persistence
11. Accessibility audit and fixes
12. Cross-browser testing

## Risk Mitigation

- **Risk**: Date picker library adds 50KB to bundle
  - **Mitigation**: Evaluate lightweight alternatives or build custom
- **Risk**: Database query slow with large datasets
  - **Mitigation**: Add index, implement pagination
- **Risk**: Date timezone issues
  - **Mitigation**: Store all dates in UTC, convert on client
```

---

## Phase 2: Test-First Development (TDD)

**GOAL**: Write tests that define expected behavior before implementation.

### Step 2.1: Write E2E Tests First

**LOCATION**: `tests/e2e/date-filter.spec.ts`

E2E tests MUST map to acceptance criteria:

```typescript
import { test, expect } from '@playwright/test';

test.describe('US-247: Date Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Date range selector appears when clicking filter button', async ({ page }) => {
    // Given: viewing task list
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible();

    // When: click filter button
    await page.click('[data-testid="filter-by-date-button"]');

    // Then: see date range selector
    await expect(page.locator('[data-testid="date-range-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-date-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="end-date-input"]')).toBeVisible();
  });

  test('AC2: Applying date filter shows only matching tasks', async ({ page }) => {
    // Given: selected date range
    await page.click('[data-testid="filter-by-date-button"]');
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-01-07');

    // When: apply filter
    await page.click('[data-testid="apply-filter-button"]');

    // Then: see filtered tasks
    await expect(page.locator('[data-testid="task-item"]')).toHaveCount(12);
    await expect(page.locator('[data-testid="task-count"]')).toContainText('Showing 12 of 156 tasks');
  });

  // AC3, AC4 tests...
});
```

### Step 2.2: Write Unit Tests

Test pure business logic functions:

```typescript
import { test, expect, describe } from 'bun:test';
import { isDateInRange, validateDateRange } from './dateUtils';

describe('Date Range Utilities', () => {
  describe('isDateInRange', () => {
    test('returns true when date is within range (inclusive)', () => {
      const date = '2024-01-05';
      const start = '2024-01-01';
      const end = '2024-01-07';

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    test('returns true when date equals start date', () => {
      const date = '2024-01-01';
      const start = '2024-01-01';
      const end = '2024-01-07';

      expect(isDateInRange(date, start, end)).toBe(true);
    });

    test('returns false when date is before range', () => {
      const date = '2023-12-31';
      const start = '2024-01-01';
      const end = '2024-01-07';

      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    test('throws error when start date is after end date', () => {
      expect(() => validateDateRange('2024-01-10', '2024-01-01'))
        .toThrow('Start date cannot be after end date');
    });

    test('throws error when range exceeds 1 year', () => {
      expect(() => validateDateRange('2024-01-01', '2025-01-02'))
        .toThrow('Date range cannot exceed 1 year');
    });
  });
});
```

### Step 2.3: Write Integration Tests

Test API endpoint with real database:

```typescript
import { test, expect, describe, beforeAll, afterAll, beforeEach } from 'bun:test';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('Date Filter API Integration', () => {
  let container;
  let sql;
  let apiUrl;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15')
      .withDatabase('test_db')
      .start();
    // Setup database and API server...
  }, 60000);

  afterAll(async () => {
    if (sql) await sql.end();
    if (container) await container.stop();
  });

  test('GET /api/tasks with date range returns filtered tasks', async () => {
    // Insert test data
    await sql`INSERT INTO tasks (text, date) VALUES
      ('Task 1', '2024-01-05'),
      ('Task 2', '2024-01-10'),
      ('Task 3', '2024-01-15')`;

    // Query with date filter
    const response = await fetch(
      `${apiUrl}/api/tasks?startDate=2024-01-01&endDate=2024-01-07`
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tasks).toHaveLength(1);
    expect(data.tasks[0].text).toBe('Task 1');
    expect(data.total).toBe(3);
  });
});
```

---

## Phase 3: Implementation (Red-Green-Refactor)

**GOAL**: Write minimal code to make tests pass, then refactor for quality.

### Red → Green → Refactor Cycle

1. **RED**: Run tests — they should fail
2. **GREEN**: Write minimal code to pass tests
3. **REFACTOR**: Improve code quality while keeping tests green

### Example Implementation

```typescript
// 1. RED - Tests fail because function doesn't exist

// 2. GREEN - Minimal implementation
export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;  // Simple but works
}

// 3. REFACTOR - Better implementation
export function isDateInRange(date: string, start: string, end: string): boolean {
  const dateObj = new Date(date);
  const startObj = new Date(start);
  const endObj = new Date(end);

  return dateObj >= startObj && dateObj <= endObj;
}
```

---

## Phase 4: Documentation Updates

**GOAL**: Update all relevant documentation with new feature.

### Step 4.1: User Documentation

**LOCATION**: `docs/user/filtering-tasks.md`

```markdown
# Filtering Tasks by Date

Learn how to filter your tasks by date range to focus on what matters.

## Opening the Date Filter

1. Click the "Filter" button above your task list
2. Select "Filter by Date" from the dropdown

## Selecting a Date Range

1. Click on the start date field
2. Choose your start date from the calendar
3. Click on the end date field
4. Choose your end date from the calendar
5. Click "Apply Filter"

Your task list will now show only tasks within the selected date range.

## Clearing the Filter

Click the "Clear Filter" button to see all tasks again.

## Tips

- Your filter preference is saved automatically
- Use keyboard shortcuts: Alt+F to open filter, Esc to close
- On mobile, swipe left on the filter bar to clear
```

### Step 4.2: Developer Documentation

**LOCATION**: `docs/developer/date-filtering-api.md`

```markdown
# Date Filtering API

## Endpoint

GET /api/tasks?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}

## Query Parameters

- `startDate` (optional): ISO 8601 date (YYYY-MM-DD)
- `endDate` (optional): ISO 8601 date (YYYY-MM-DD)

## Response

```json
{
  "data": {
    "tasks": [...],
    "total": 156,
    "filtered": 12
  }
}
```

## Error Responses

- 400: Invalid date format or range
- 401: Unauthorized
- 500: Server error
```

### Step 4.3: Update API Documentation

Add endpoint to API reference in `docs/api/endpoints.md`.

---

## Phase 5: Code Review Process

**GOAL**: Ensure code quality through peer review.

### Step 5.1: Self-Review Checklist

Before requesting review:

- [ ] All tests pass locally
- [ ] Code follows style guidelines (run `bun run lint`)
- [ ] Type checking passes (run `bun run type-check`)
- [ ] No console.log or debugger statements
- [ ] Complex logic has explanatory comments
- [ ] Public APIs have JSDoc comments
- [ ] User and developer docs updated
- [ ] Storybook stories added for components
- [ ] Accessibility tested (keyboard navigation, screen reader)
- [ ] Mobile responsive design verified
- [ ] Performance tested (no regressions)

### Step 5.2: Create Pull Request

Use PR template (see [09-git-workflow.md](./09-git-workflow.md)).

### Step 5.3: Address Review Feedback

- Respond to every comment
- Make requested changes in new commits
- Re-request review after changes
- Discuss disagreements constructively

---

## Phase 6: Quality Gates & CI/CD

**GOAL**: Automated validation ensures quality standards are met.

### Required CI Checks

ALL must pass before merge:

1. **Linting** (`bun run lint:check`)
2. **Type Checking** (`bun run type-check`)
3. **Unit Tests** (`bun run test:unit`)
4. **Integration Tests** (`bun run test:integration`)
5. **E2E Tests** (`bun run test:e2e`)
6. **API Tests** (`bun run test:api`)
7. **Coverage** (≥ 85%)
8. **Build** (`bun run build`)
9. **Security Scan** (dependency vulnerabilities)
10. **Performance Tests** (no regressions)

### AI Agent Reviews

See [17-ci-cd-pipeline.md](./17-ci-cd-pipeline.md) for agent details:

- Security Agent
- Performance Agent
- Code Quality Agent
- Test Quality Agent
- Documentation Agent
- Git Quality Agent
- User Story Alignment Agent
- Architecture Agent

### Merge Criteria

- ✅ All CI checks pass
- ✅ At least one approval from code owner
- ✅ All review comments resolved
- ✅ Branch up to date with main
- ✅ No merge conflicts

---

## Phase 7: Deployment & Monitoring

**GOAL**: Deploy to production and monitor for issues.

### Step 7.1: Deploy to Staging

- Automatic deployment on merge to main
- Run smoke tests
- Manual QA verification
- Product owner approval

### Step 7.2: Deploy to Production

- Gradual rollout (10% → 50% → 100%)
- Monitor error rates
- Monitor performance metrics
- Watch user feedback

### Step 7.3: Post-Deployment Monitoring

**Monitor**:
- Error rates (should not increase)
- API response times (should stay under SLA)
- User engagement (should improve based on expected impact)
- Customer support tickets (should not spike)

**Rollback Criteria**:
- Error rate > 1%
- Response time > 2x baseline
- Critical bug reported
- Security vulnerability discovered

### Step 7.4: Gather Feedback

- Review analytics (task completion rate increase?)
- Collect user feedback
- Monitor support tickets
- Conduct user interviews

---

## Loop Completion & Iteration

After deployment:

1. **Measure Impact**: Did we achieve expected business outcomes?
2. **Document Learnings**: What went well? What could improve?
3. **Plan Next Iteration**: Based on feedback, what's next?
4. **Update Estimates**: Were story points accurate?

---

## Summary: Development Checklist

For EVERY feature, ensure:

- [ ] User story created with acceptance criteria
- [ ] Technical spec written and reviewed
- [ ] E2E tests written (map to ACs)
- [ ] Unit tests written for business logic
- [ ] Integration tests for API/database
- [ ] Implementation follows TDD (red-green-refactor)
- [ ] User documentation updated
- [ ] Developer documentation updated
- [ ] API documentation updated
- [ ] Self-review completed
- [ ] PR created with complete description
- [ ] Code review approved
- [ ] All CI checks pass
- [ ] Merged to main
- [ ] Deployed to staging and tested
- [ ] Deployed to production
- [ ] Monitoring shows no issues
- [ ] Impact measured and documented

This complete loop ensures quality, maintainability, and user value delivery.
