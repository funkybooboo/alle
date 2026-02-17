# Roadmap

This document outlines the development roadmap for Alle. We use semantic versioning to define chunks of work and track our progress.

## v0.1.0: Foundations

This release focuses on establishing the project's foundation, including the core architecture, development environment, and documentation.

- [x] **Monorepo Setup:** Set up a monorepo with `bun` to manage the `client`, `server`, and `shared` packages.
- [x] **Tech Stack:**
    -   Frontend: Svelte with SvelteKit
    -   Backend: Bun
    -   Language: TypeScript
- [x] **Architecture:** Implement a clean, modular architecture using the Adapter Pattern.
- [x] **Code Quality:** Configure Biome for formatting and linting.
- [x] **API:**
    -   Setup basic CRUD endpoints for tasks.
    -   Use Bun's built-in HTTP server.
- [x] **Client:**
    -   Setup basic client with a simple UI to display tasks.
- [x] **Documentation:**
    -   Create comprehensive documentation for architecture, code standards, testing, and more.
- [x] **Testing:**
    -   Setup Playwright for E2E testing.
    -   Setup Bruno for API testing.

## v0.1.1: Refactor to Svelte
This release is dedicated to replacing the initial React client with a new SvelteKit application.
- [ ] **Scaffold SvelteKit App:** Create a new SvelteKit application in the `packages/client` directory.
- [ ] **Setup Basic UI:** Re-create the basic UI for displaying tasks in Svelte.
- [ ] **Ensure Feature Parity:** The Svelte client should have the same basic functionality as the original React client.

### Technical Notes & Considerations
- This will be a "rip and replace" of the `packages/client` directory.
- Storybook and Playwright configurations will need to be updated for Svelte.

### Definition of Done
- The `packages/client` directory contains a clean, working SvelteKit application.
- The basic UI for displaying tasks is functional.
- All previous client-side functionality (as of `v0.1.0`) is implemented in the new Svelte client.

## v0.2.0: Core Task Model
This release focuses on the in-memory data structures and business logic for tasks.
- [ ] **Task CRUD:** Implement the fundamental Create, Read, Update, and Delete operations for tasks in memory.
- [ ] **Task Completion:** Allow tasks to be marked as complete and visually distinguished from incomplete tasks.
- [ ] **Future & Someday Tasks:**
    - [ ] Implement the ability to assign tasks to a future date.
    - [ ] Create a dedicated "Someday" or "Inbox" area for tasks without a specific due date.

### Technical Notes & Considerations
- The `Task` model should be defined in the `packages/shared` directory to be used by both the client and server.
- Business logic (e.g., how tasks are sorted, what fields are required) should be kept within the core model definition.

### Definition of Done
- The `Task` model is fully defined with all necessary fields.
- All CRUD operations are functional and have unit tests.
- The concept of "Someday" tasks is implemented and tested.

## v0.3.0: API Endpoints
This release focuses on creating the API for interacting with the task model.
- [ ] **Task API:** Create API endpoints for all Task CRUD operations.
- [ ] **Date API:** Create API endpoints for fetching tasks by date.

### Technical Notes & Considerations
- A RESTful API design should be used.
- All API endpoints should be documented using a standard like OpenAPI.
- Zod or a similar library should be used for robust input validation on the server.

### Definition of Done
- All API endpoints are implemented and tested with Bruno.
- API documentation is generated and up-to-date.
- Input validation is implemented for all endpoints.

## v0.4.0: Basic UI
This release focuses on creating a minimal UI to display and interact with tasks.
- [ ] **Display Tasks:** Create a UI to display tasks for a given day.
- [ ] **Interact with Tasks:** Create a UI to create, edit, delete, and complete tasks.

### Technical Notes & Considerations
- The UI should be built with Svelte and SvelteKit.
- Svelte's built-in stores should be sufficient for state management in the early stages.
- All new UI components should be developed in Storybook for isolation and testing.

### Definition of Done
- Users can view a list of tasks for a given day.
- Users can create, edit, delete, and complete tasks through the UI.
- All new UI components have stories in Storybook.

## v0.5.0: Keyboard Navigation & Actions
This release focuses on the core keyboard navigation and actions.
- [ ] **Keyboard Navigation:** Implement a system for navigating between days, weeks, and tasks using only the keyboard (e.g., arrow keys, `j`/`k`).
- [ ] **Keyboard Actions:** All core actions (create, edit, delete, complete, move) must be triggerable via keyboard shortcuts (e.g., `n` for new, `e` for edit, `d` for delete).

### Technical Notes & Considerations
- A library like `mousetrap` or `hotkeys-js` could be used to manage keyboard shortcuts.
- The focus management system will be critical for a good keyboard-first experience. Pay close attention to how focus shifts after an action is performed.

### Definition of Done
- All UI elements are navigable using the keyboard.
- All core actions are triggerable with keyboard shortcuts.
- E2E tests are created to verify all keyboard interactions.

## v0.6.0: Drag-and-Drop
This release introduces drag-and-drop as a secondary interaction method.
- [ ] **Drag-and-Drop:** Allow tasks to be reordered and moved between days via drag-and-drop.

### Technical Notes & Considerations
- A library like `svelte-dnd-action` should be evaluated for this feature.
- Accessibility is a key concern for drag-and-drop. Ensure that there is a keyboard-accessible alternative for all drag-and-drop actions (this is covered in v0.5.0).

### Definition of Done
- Tasks can be reordered within a day using drag-and-drop.
- Tasks can be moved between days using drag-and-drop.
- E2E tests are created to verify all drag-and-drop interactions.

## v0.7.0: Layout & Responsiveness
This release focuses on the visual organization of the UI and ensuring it works on different screen sizes.
- [ ] **Weekly Layout:** Design and implement a primary view that shows tasks for an entire week, providing context and clarity.
- [ ] **Responsive Design:** Ensure the layout is usable on a variety of screen sizes, from mobile to desktop.

### Technical Notes & Considerations
- A CSS-in-JS library (e.g., Styled Components, Emotion) or a utility-first CSS framework (e.g., Tailwind CSS) should be chosen to handle styling. The choice will have a significant impact on the developer experience.
- The weekly layout should be the default on larger screens, while a daily or agenda view might be more appropriate for smaller screens.

### Definition of Done
- The weekly layout is implemented and functional.
- The application is fully responsive and usable on mobile, tablet, and desktop screen sizes.
- E2E tests are created to verify the responsive behavior.

## v0.8.0: I/O & Data
This release implements the I/O agnostic persistence layer and data export functionality.
- [ ] **I/O Abstraction Layer:** Solidify the I/O adapter pattern to ensure the application core is completely independent of the data source.
- [ ] **Persistence Adapters:**
    - [ ] **In-Memory:** Create an adapter for storing data in memory, suitable for testing and ephemeral sessions.
    - [ ] **File System:** Implement an adapter that persists data to a local file (e.g., JSON, or a self-contained SQLite database).
    - [ ] **Database:** Implement an adapter for a full-fledged database like PostgreSQL, with Redis for optional caching to improve performance.
- [ ] **Configuration:** Allow the user to easily configure their desired persistence method via a configuration file or environment variables.
- [ ] **Data Export:**
    - [ ] Implement a one-click "Export All Data" feature.
    - [ ] Ensure the export format is well-documented and portable (e.g., a structured JSON or a set of human-readable Markdown files).

### Technical Notes & Considerations
- The choice of file system adapter (single JSON file vs. directory of Markdown files) will impact the complexity of the implementation. A single JSON file is likely simpler to start with.
- For the database adapter, a lightweight ORM like Prisma or Drizzle ORM could be used to simplify database interactions.
- The configuration system should be able to read from both environment variables and a configuration file. A library like `dotenv` can be used for this.

### Definition of Done
- The I/O abstraction layer is fully implemented and tested.
- All three persistence adapters (in-memory, file system, database) are implemented and have unit tests.
- The data export feature is functional and produces a well-formatted output.

## v0.9.0: UI Polish & Theming
This release is dedicated to refining the user interface and experience, creating a calm, modern, and productive aesthetic.
- [ ] **UI/UX Vision:**
    - [ ] Conduct a design pass to create a cohesive visual language that borrows the simplicity of TeuxDeux and the clarity of Basecamp.
    - [ ] Ensure all necessary UI elements are readily accessible, minimizing clicks and context switching.
- [ ] **Theming:**
    - [ ] Implement a robust theming system.
    - [ ] Create polished, high-contrast light and dark modes.
- [ ] **Focus & Clarity:** Refine animations, transitions, and visual feedback to create a calm, focused, and productive feel.

### Technical Notes & Considerations
- A design system should be established to ensure consistency across the application. This includes defining a color palette, typography, spacing, and component styles.
- The theming system should be built in a way that makes it easy to add new themes in the future. CSS variables are a good choice for this.
- Svelte's built-in transition and animation functions should be sufficient for most animations.

### Definition of Done
- A clear, consistent design system is in place.
- The light and dark themes are fully implemented and polished.
- The application has a calm, focused, and productive feel, with subtle and meaningful animations.

## v0.10.0: Basic Automation
This release introduces the first set of automation features to reduce manual effort and make the app smarter.
- [ ] **Task Rollover:** Automatically move any unfinished tasks from the previous day to the current day.
- [ ] **Recurring Tasks:**
    - [ ] Implement a system for creating tasks that recur on a daily, weekly, or monthly basis.
    - [ ] Ensure recurring tasks are automatically created for the appropriate day.

### Technical Notes & Considerations
- A library for handling recurring dates (e.g., `rrule.js`) will be necessary.
- The logic for creating recurring tasks should be handled by a background job or a cron job to avoid blocking the main thread.
- The task rollover feature should be configurable by the user (e.g., they can turn it on or off).

### Definition of Done
- The task rollover feature is fully functional and configurable.
- The recurring tasks feature is fully functional and supports daily, weekly, and monthly recurrence.
- Unit and E2E tests are created for both features.

## v0.11.0: User Accounts
This release adds multi-user support.
- [ ] **User Authentication:**
    - [ ] Implement user registration and login.
    - [ ] Securely store user credentials.
- [ ] **Data Scoping:** Associate all tasks and related data with a specific user account.

### Technical Notes & Considerations
- A library like Passport.js could be used to handle authentication strategies.
- JWTs (JSON Web Tokens) should be used for session management.
- All API endpoints must be protected to ensure that users can only access their own data. This will require a middleware that checks for a valid JWT on each request.

### Definition of Done
- Users can register, login, and logout.
- All tasks are associated with a user account.
- All API endpoints are protected and properly scoped to the authenticated user.
- E2E tests are created for all authentication and authorization flows.

## v0.12.0: Markdown Support
This release enhances the task description format.
- [ ] **Markdown Rendering:**
    - [ ] Integrate a Markdown parser to render task descriptions.
    - [ ] Support basic formatting like headers, bold, italics, lists, and links.

### Technical Notes & Considerations
- A library like `marked` should be used for rendering Markdown.
- Sanitization of the user-provided Markdown is critical to prevent XSS attacks. A library like `dompurify` should be used.

### Definition of Done
- Task descriptions are rendered as Markdown.
- All user-provided HTML is sanitized to prevent XSS attacks.
- E2E tests are created to verify Markdown rendering and sanitization.


## v1.0.0: Public Release

This will be the first stable, public release of Alle. It will include all the features from the previous releases, plus any additional polishing and bug fixes.

*   **[ ] Polishing:**
    *   [ ] Finalize the UI/UX.
    *   [ ] Ensure the application is responsive and works well on all devices.
    *   [ ] Implement an "Undo" feature for common actions.
*   **[ ] Core Features:**
    *   [ ] Implement a system for sending reminders.
    *   [ ] Allow users to define custom colors for tasks and display a legend.
    *   [ ] Allow users to set their local timezone.
    *   [ ] Allow users to select and act on multiple tasks at once.
    *   [ ] Implement a powerful and intuitive search functionality.
    *   [ ] Automatically detect and render links in task descriptions.
*   **[ ] Deployment:**
    *   [ ] Dockerize the application.
    -   [ ] Set up a CI/CD pipeline for automated testing and deployment.
*   **[ ] Internationalization:**
    *   [ ] Add support for multiple languages.

### Technical Notes & Considerations
- A library like `i18next` should be used to manage translations.
- The CI/CD pipeline should be configured to run all tests, and then build and deploy the application to a hosting provider (e.g., Vercel, Netlify, or a cloud provider like AWS or GCP).
- Docker images should be optimized for size and security.

### Definition of Done
- The application is feature-complete as defined by the previous releases.
- The application is stable and has been thoroughly tested.
- The application is deployed and publicly accessible.

## v1.1.0: Advanced Task Management
- [ ] **Multi-select Items:** Allow users to select and act on multiple tasks at once.
- [ ] **Turn Recurring Tasks On/Off:** Easily toggle recurring tasks without deleting them.
- [ ] **Order Recurring Items:** Allow users to define a specific order for recurring tasks.
- [ ] **Better Searching:** Implement a more powerful and intuitive search functionality.
- [ ] **Support for Links:** Automatically detect and render links in task descriptions.

## v1.2.0: Advanced Automation
- [ ] **2-Day Rule:** Priority rises over time for recurring items that are not completed. Non-recurring items are moved to the next day.
- [ ] **Conditional Tasks:** Set conditions on tasks (e.g., "complete X tasks this week to unlock Y").
- [ ] **Smart Task Sorting:** Automatically sort and prioritize tasks based on due dates, priority flags, or other user-defined rules.
- [ ] **Auto Project/Course Scheduling:** Automatically schedule and shift project or course-related tasks based on user-defined timelines and dependencies.
- [ ] **Cron Scheduling:** Advanced scheduling options for tasks using cron expressions.

## v1.3.0: UI & Customization
- [ ] **Custom Colors & Legend:** Let users define custom colors for tasks and display a legend.
- [ ] **Adjustable Panes:** Allow users to resize different parts of the UI.
- [ ] **Custom Keybindings:** Allow users to create their own custom keybindings.
- [ ] **Timezone Support:** Allow users to set their local timezone.

## v1.4.0: Collaboration
- [ ] **Share Calendars:**
    - [ ] Share calendars/task lists with other users.
    - [ ] Set read-only or edit access.
- [ ] **Email Sharing:** Integrate with the standard email sharing API to share tasks.

## v1.5.0: Personal Wellness
- [ ] **Habit Trackers:**
    - [ ] Track habits and view statistics over time.
    - [ ] Include a happiness tracker.
- [ ] **Daily Journal:**
    - [ ] A space for daily journaling.
    - [ ] Sync with Obsidian.

## v2.0.0: Major New Features

- [ ] **Advanced Project Management:** Expand beyond basic project boards with advanced features.
- [ ] **Integrations:** Integrate with other services like calendars or project management tools.
- [ ] **Expense Tracker:**
    - [ ] Basic expense tracking and budgeting.
    - [ ] Potential integration with services like [Fintable](https://fintable.io/).
- [ ] **Automatic Meal Planner:**
    - [ ] Generate meal plans and recipes.
    - [ ] Integrate with a recipe API like [TheMealDB](https://www.themealdb.com/api.php).
- [ ] **Automatic Exercise Planner:**
    - [ ] Suggest workouts based on user goals and available equipment.
    - [ ] Integrate with data from sources like [Kaggle Gym Exercise Data](https://www.kaggle.com/datasets/niharika41298/gym-exercise-data).
- [ ] **Mobile App:** Create a native mobile app for iOS and Android.

---

# 🎯 Vision: Unified Daily + Project Management System

This section outlines a comprehensive vision for transforming Alle into a unified task management system that bridges strategic project planning with tactical daily execution. This vision combines:

- **Daily execution view** (TeuxDeux-style columns for what to work on today)
- **Project management** (collections of sequential tasks with dependencies)
- **Recurring tasks** (habits and life-maintenance with streak tracking)
- All powered by a **single unified Task data model**

## Core Philosophy

The system eliminates the need to maintain separate project boards and daily planners by unifying them into one coherent interface. The Kanban board becomes the planning surface, and the daily columns become the execution surface, with both views powered by the same underlying task data.

**Key Principles:**
- One task type that can appear in different views depending on attributes
- Project boards feed tasks directly into daily columns (no manual re-entry)
- Recurring tasks automatically populate daily columns
- Sequential project tasks with dependencies
- Auto-rollover for incomplete tasks with "late" tracking
- Streak tracking for recurring habits

## Unified Data Model

### Enhanced Task Type

The current `Task` model would be extended to support all task types:

```typescript
interface Task {
  // Existing fields
  id: string
  text: string
  completed: boolean
  date: string | null              // null = unscheduled
  createdAt: string
  updatedAt: string
  
  // NEW: Project relationship
  projectId: string | null         // null = standalone task
  position: number | null          // Order within project (null for standalone)
  state: 'ready' | 'scheduled' | 'done'  // Project task workflow state
  
  // NEW: Recurrence support  
  recurringTaskId: string | null   // Links to RecurringTask template
  instanceDate: string | null      // Which date this instance represents
  
  // NEW: Late/overdue tracking
  originalScheduledDate: string | null  // Track if task was moved
  daysLate: number                 // Auto-calculated
  
  // NEW: Dependencies (for sequential project tasks)
  dependsOn: string | null         // Task ID that must be completed first
}
```

**Task Types (all use same Task interface):**
1. **Standalone tasks** - one-off items (`projectId: null`, `recurringTaskId: null`)
2. **Project tasks** - belong to a project, have order and state
3. **Recurring task instances** - generated from templates, track streaks

### New Core Entities

**Project:**
```typescript
interface Project {
  id: string
  name: string
  description: string | null
  startDate: string | null         // When project work begins
  dueDate: string | null           // When project must be complete
  isActive: boolean                // Active = tasks distributed to daily view
  createdAt: string
  completedAt: string | null
}
```

**RecurringTask (template):**
```typescript
interface RecurringTask {
  id: string
  text: string
  recurrenceRule: string           // rrule.js format (DAILY, WEEKLY, etc.)
  startDate: string                // When recurrence begins
  endDate: string | null           // Optional end date
  createdAt: string
}
```

**RecurringTaskStats (separate entity for tracking):**
```typescript
interface RecurringTaskStats {
  recurringTaskId: string
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  lastCompletedDate: string | null
}
```

## Key Features & Behaviors

### 1. Project Management

**Projects are collections of related tasks** to accomplish a larger goal (e.g., "Build Alle Feature", "CS 101 Final Project").

**Features:**
- Create projects with name, description, start/due dates
- Add tasks to projects in a specific order
- Tasks have sequential dependencies (Task 2 depends on Task 1)
- Drag to reorder tasks (updates dependencies automatically)
- Activate project to distribute tasks across daily columns
- Auto-distribution algorithm spreads tasks between start and due dates
- Manual override: drag specific tasks to specific days

**Project States:**
- **Inactive** - tasks are unscheduled, ready for planning
- **Active** - tasks are distributed to daily columns between start/due dates

**Task States:**
- **Ready** - task is in project but not scheduled to a day
- **Scheduled** - task is assigned to a specific day
- **Done** - task is completed

### 2. Recurring Tasks

**Recurring tasks are life-maintenance activities** like eating, exercise, cleaning, budgeting that repeat on a schedule.

**Features:**
- Create recurring task templates with text and recurrence rule
- Recurrence patterns: Daily, Weekly, Monthly, Yearly (using rrule.js)
- Instances automatically appear in daily columns without manual entry
- Hybrid generation: current week + next week on load, on-demand for future
- Streak tracking: current streak, longest streak, total completions
- Completing an instance updates streak stats
- Missed days break streaks

**Example:**
- Template: "Exercise" (recurs daily)
- Instances appear in each day's column
- Completing Monday's instance increments current streak
- Skipping Tuesday breaks the streak (resets to 0)

### 3. Daily Execution View

**The primary interface** showing unified task list for a specific day.

**Features:**
- Date selector with prev/next/today navigation
- Displays three task types in one unified list:
  - **Recurring habits** - instances from templates
  - **Project tasks** - scheduled from active projects
  - **Standalone tasks** - one-off items
- Visual distinction between types (icons, colors, sections)
- Task interactions: complete, edit, delete, drag to different day
- Quick-add for standalone tasks
- Visual indicators:
  - 🔥 Streak counter for recurring tasks
  - "LATE: X days" badge for overdue tasks
  - 🔒 Blocked indicator for tasks with unmet dependencies
  - Project badge showing which project task belongs to

**Unified View Example:**
```
Monday, Feb 17

RECURRING HABITS
☐ Exercise (7 day streak 🔥)
☐ Budget review

PROJECT: Build Alle Feature
☐ Design data model (1/5) [LATE: 2 days]
☐ Write API endpoints (2/5) [BLOCKED]

STANDALONE TASKS
☐ Buy groceries
☐ Call dentist
```

### 4. Task Distribution & Scheduling

**Auto-distribution algorithm** when a project is activated:

1. Get all project tasks in order (by `position`)
2. Calculate available days between start and due dates
3. Distribute tasks sequentially across days
4. Respect dependencies (Task 2 can't be scheduled before Task 1)
5. Mark distributed tasks as `state: 'scheduled'` with assigned `date`

**Manual scheduling:**
- Drag task from project detail view to specific day in daily view
- Override auto-distribution for specific tasks
- Still respects dependencies (shows warning if moved before dependency)

**Smart scheduling (future enhancement):**
- Consider task effort/duration
- Balance tasks per day based on capacity
- Re-distribute when tasks run late

### 5. Dependencies & Sequential Execution

**Sequential project tasks** ensure work happens in the right order.

**Features:**
- Tasks have explicit order within project (position 1, 2, 3...)
- Each task depends on the previous task (`task.dependsOn` = previous task ID)
- Drag to reorder updates both position and dependencies
- Blocked tasks can't be completed until dependency is met
- Visual indicator shows which task is blocking completion
- Warning when moving/scheduling would break dependency chain

**Example:**
1. "Research architecture" (no dependency)
2. "Design data model" (depends on task 1)
3. "Write API endpoints" (depends on task 2)

If task 1 isn't complete, task 2 shows as "Blocked" with lock icon and tooltip.

### 6. Late Task Handling & Auto-Rollover

**Automatic rollover** ensures incomplete tasks don't get lost.

**Features:**
- Daily background job (or on app load) checks yesterday's incomplete tasks
- Incomplete `scheduled` tasks automatically move to today
- `originalScheduledDate` tracks when task was first scheduled
- `daysLate` calculates how many days overdue (today - originalScheduledDate)
- Visual "LATE: X days" badge in daily view
- Option to reset original date (mark as "on time" again)

**Example:**
- Task scheduled for Monday
- Not completed Monday → auto-moves to Tuesday
- `originalScheduledDate: "2026-02-17"`, `daysLate: 1`
- Still not done Tuesday → moves to Wednesday, `daysLate: 2`

### 7. Streak Tracking & Habit Building

**Streak tracking** provides motivation for recurring tasks.

**Features:**
- When recurring instance completed → update `RecurringTaskStats`:
  - Increment `totalCompletions`
  - Check if yesterday's instance was completed:
    - If yes → increment `currentStreak`
    - If no → reset `currentStreak` to 1
  - Update `longestStreak` if current exceeds it
  - Set `lastCompletedDate` to today
- Display current streak in daily view (🔥 icon + number)
- Completion history calendar showing which days completed
- Streak graph visualization
- Motivational feedback ("You're on a 7 day streak!")

**Example:**
- Monday: Complete "Exercise" → currentStreak = 1, totalCompletions = 1
- Tuesday: Complete "Exercise" → currentStreak = 2, totalCompletions = 2
- Wednesday: Skip "Exercise" → currentStreak remains 2
- Thursday: Complete "Exercise" → currentStreak = 1 (streak broken), totalCompletions = 3

### 8. Movement Constraints

**Different task types have different movement rules.**

**Constraints:**
- **Recurring templates** - Cannot be moved (edit recurrence rule instead)
- **Recurring instances** - Can move freely (only affects that instance)
- **Project tasks** - Can move but shows warning if breaks dependencies
- **Standalone tasks** - Can move freely without restrictions

**Tracking:**
- When any task is moved from original date → track `originalScheduledDate`
- Calculate `daysLate` if moved to later date
- Show visual indicator for late tasks

## User Interface Architecture

### View Hierarchy

**Primary View: Daily Execution**
- Default landing page
- Shows unified task list for selected day
- Date selector navigation
- Links to project detail for project tasks
- Links to recurring task stats for recurring tasks

**Secondary View: Project Management**
- List of all projects (active/inactive sections)
- Create/edit project form
- Project detail showing ordered task list
- Activate/deactivate buttons
- Auto-distribute button with preview
- Drag to reorder tasks

**Tertiary View: Recurring Task Management**
- List of all recurring task templates
- Create/edit recurring task form
- Recurrence rule builder (presets + custom)
- Completion history calendar
- Streak statistics and visualizations

### Navigation Pattern

**Daily-first approach:**
- App opens to daily execution view
- Navigation tabs/buttons: `[Daily] [Projects] [Recurring Tasks]`
- Keyboard shortcut to cycle views (Tab or Cmd+1/2/3)
- Contextual links (click project task → jump to project detail)

### Interaction Models

**Daily View:**
- Click checkbox → complete task
- Click task text → inline edit
- Drag task → move to different day
- `[+]` button → quick-add standalone task
- Project badge click → jump to project detail
- Streak icon click → view recurring task stats

**Project View:**
- Create project → form with name, dates, description
- Add task → creates in `ready` state, unscheduled
- Drag tasks → reorder position
- `[Activate]` → runs distribution algorithm
- `[Auto-distribute]` → show preview, confirm, then distribute
- Drag task to day → manual schedule override

**Recurring View:**
- Create recurring task → form with text, recurrence rule, dates
- Recurrence builder → presets or custom rrule
- View stats → calendar, streak graph, totals
- Edit template → updates future instances only

## Implementation Roadmap

### Phase 1: Enhanced Data Model (v0.2.0 - Enhanced)
- Extend Task type with all new fields
- Create Project, RecurringTask, RecurringTaskStats types
- Build repository interfaces for all entities
- Implement in-memory repositories
- Integrate rrule.js for recurrence logic
- **100% TDD approach** - tests first, then implementation

### Phase 2: Comprehensive APIs (v0.3.0 - Enhanced)
- Project endpoints (CRUD, activate, deactivate, distribute)
- RecurringTask endpoints (CRUD, generate instances, stats)
- Enhanced Task endpoints (unified daily view, reschedule, complete with streaks)
- Business logic services:
  - TaskDistributionService (auto-layout algorithm)
  - DependencyValidationService (check completion eligibility)
  - StreakCalculationService (update stats)
  - AutoRolloverService (move incomplete tasks)
- Zod validation for all new fields
- OpenAPI documentation
- **Bruno tests written BEFORE implementation (TDD)**

### Phase 3: Daily Execution UI (v0.4.0 - Enhanced)
- DailyView component with unified task list
- Display all three task types with visual distinction
- Task interactions (complete, edit, delete)
- Visual indicators (late badge, blocked, streak, project)
- Quick-add task form
- Svelte stores with optimistic updates
- **Storybook stories + component tests BEFORE implementation (TDD)**

### Phase 4: Project Management UI (v0.5.0 - NEW)
- Project list view (active/inactive)
- Project create/edit forms
- Project detail with ordered task list
- Task management (add, reorder, delete)
- Manual scheduling (assign to day)
- Activation flow with distribution preview
- Dependency visualization
- **Full TDD with stories and tests first**

### Phase 5: Recurring Task UI (v0.6.0 - NEW)
- Recurring task template list
- Recurrence rule builder (presets + custom)
- Preview of upcoming instances
- Create/edit forms
- Completion history calendar
- Streak visualization
- **TDD approach throughout**

### Phase 6: Movement & Constraints (v0.7.0 - Enhanced)
- Drag-and-drop between days
- Drag within project (reorder)
- Drag from project to day (schedule)
- Movement constraints enforcement
- Late task handling (auto-rollover)
- Track originalScheduledDate
- **E2E tests for all drag scenarios (TDD)**

### Phase 7: Keyboard Navigation (v0.8.0 - Moved from v0.5.0)
- Navigate between days/tasks
- Switch views with keyboard
- Action shortcuts (n, e, d, Space, m)
- Focus management
- **Full TDD with keyboard tests**

### Phase 8: Responsive Layout (v0.9.0 - Moved from v0.7.0)
- Weekly layout (7-day view)
- Responsive breakpoints
- Light/dark theming
- Task type color-coding
- **E2E tests for responsive behavior**

### Phase 9: PostgreSQL Persistence (v0.10.0 - Enhanced)
- PostgreSQL adapters for all repositories
- Database migrations
- Environment-based configuration
- Optional Redis caching
- Data export/import (JSON)
- **Migration path from in-memory**

### Phase 10: UI Polish (v0.11.0 - Moved from v0.9.0)
- Design system establishment
- Refined light/dark themes
- Smooth animations
- Calm, focused aesthetic

### Phase 11: Advanced Automation (v0.12.0 - Enhanced)
- **Full streak tracking automation:**
  - Automatic streak calculation on completion
  - Detect streak breaks
  - Update longest streak
  - Background job or app-load trigger
- **Task rollover automation:**
  - Daily job to move incomplete tasks
  - Mark with "late" status
  - Track days late
- **2-Day Rule (optional):**
  - Priority rises for uncompleted recurring tasks
- **Smart scheduling (optional):**
  - Suggest distribution based on capacity
  - Auto-adjust when tasks run late
- **Instance management:**
  - Hybrid generation (current+next week, on-demand for future)
  - Cleanup old completed instances
- **TDD for all automation logic**

### Phase 12: Public Release (v1.0.0 - Updated)
- Full QA pass
- Performance optimization
- Accessibility audit
- Complete documentation
- Dockerization
- CI/CD pipeline
- 85%+ test coverage
- Additional features:
  - Undo/redo system
  - Search and filtering
  - Bulk operations
  - Task notes/descriptions

## Benefits of This Approach

### For Users
- **No duplicate entry** - create task once, appears in both project and daily views
- **Automatic scheduling** - projects distribute tasks across days automatically
- **Never miss habits** - recurring tasks appear every day without manual creation
- **Stay focused** - clear view of exactly what to work on today
- **Build streaks** - motivation through habit tracking
- **Handle late work** - automatic rollover with visible late indicators
- **Respect dependencies** - system prevents completing tasks out of order

### For Developers
- **Single task model** - one type handles all use cases
- **Clean architecture** - adapter pattern makes swapping implementations easy
- **Type safety** - TypeScript ensures consistency
- **TDD approach** - tests first prevents bugs
- **Well-tested** - comprehensive coverage at all levels
- **Extensible** - easy to add new task types or views

## Future Enhancements

Beyond v1.0.0, consider:

- **Effort estimation** - tasks have estimated time, daily view shows total
- **Capacity planning** - limit tasks per day based on available hours
- **Priority levels** - high/medium/low priority for task ordering
- **Tags/labels** - cross-cutting categorization beyond projects
- **Task templates** - quickly create common project structures
- **Dependency graphs** - visualize complex dependency chains
- **Project templates** - reusable project structures (e.g., "Course Template")
- **Recurring projects** - projects that repeat (e.g., quarterly reviews)
- **Time tracking** - track actual time spent on tasks
- **Analytics** - completion rates, streak statistics, productivity insights
- **Collaboration** - share projects with others
- **Mobile apps** - native iOS/Android with offline support
- **Calendar integration** - sync with Google Calendar, Outlook, etc.
- **Smart suggestions** - AI-powered task distribution and scheduling

## Migration Strategy

For existing Alle installations:

1. **Database migration** - add new columns to tasks table (projectId, position, state, etc.)
2. **Backwards compatibility** - existing tasks become standalone tasks (all new fields null)
3. **Gradual adoption** - users can start using projects/recurring without affecting existing workflow
4. **Data export** - allow exporting before migration for safety
5. **Documentation** - clear guide for understanding new features

## Open Questions & Decisions

### Design Decisions
- [ ] Should "Someday" be a special project, or a state, or just unscheduled tasks?
- [ ] How to visualize dependency chains in project view? (Tree? Gantt? Simple list?)
- [ ] Should recurring tasks have their own dedicated "habits" section in daily view?
- [ ] What should happen to unscheduled project tasks when project is deactivated?

### Technical Decisions
- [ ] Should RecurringTaskStats be a separate table or embedded in RecurringTask?
- [ ] How many recurring instances to generate ahead of time (1 week? 1 month?)
- [ ] Should auto-rollover run as cron job, on app load, or both?
- [ ] What's the cascade behavior when deleting a project with tasks?
- [ ] Should circular dependency detection be strict (error) or warning?

### UX Decisions
- [ ] Should project activation require confirmation or happen immediately?
- [ ] How to handle conflicts when manually moving a task breaks dependencies?
- [ ] Should completing a blocking task auto-schedule dependent tasks?
- [ ] What's the default behavior for new tasks (standalone vs project)?
- [ ] How prominent should streak counters be (motivating vs distracting)?

## Success Metrics

How we'll know this vision is successful:

**User Metrics:**
- Users create and maintain active projects
- Recurring tasks have high completion rates
- Daily view is primary interface (>80% of time)
- Streak lengths increase over time
- Late task count decreases over time
- User reports "no longer need separate todo app and project manager"

**Technical Metrics:**
- >85% test coverage maintained
- <100ms response time for daily view
- Zero data loss incidents
- Clean architecture maintained (easy to swap adapters)
- All E2E tests passing
- Biome checks passing

**Product Metrics:**
- Feature adoption (% of users using projects, recurring tasks)
- User retention (daily/weekly active users)
- Task completion rates
- Time to first project created
- Time to first recurring task created
- User satisfaction (NPS score)

---

**This vision represents the evolution of Alle from a simple daily task manager into a comprehensive unified system that eliminates the friction between planning and execution, between project management and daily habits, and between strategic thinking and tactical action.**
