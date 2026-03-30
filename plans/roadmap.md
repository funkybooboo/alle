# Roadmap

This document outlines the development roadmap for Alle. We use semantic versioning to define chunks of work and track our progress.

---

## v0.1.0: Foundations

This release focuses on establishing the project's foundation, including the core architecture, development environment, and documentation.

- [x] **Monorepo Setup:** Set up a monorepo with `bun` to manage the `client`, `server`, and `shared` packages.
- [x] **Tech Stack:**
    - Frontend: Svelte with SvelteKit
    - Backend: Bun
    - Language: TypeScript
- [x] **Architecture:** Implement a clean, modular architecture using the Adapter Pattern.
- [x] **Code Quality:** Configure Biome for formatting and linting.
- [x] **API:**
    - Setup basic CRUD endpoints for tasks.
    - Use Bun's built-in HTTP server.
- [x] **Client:**
    - Setup basic client with a simple UI to display tasks.
- [x] **Documentation:**
    - Create comprehensive documentation for architecture, code standards, testing, and more.
- [x] **Testing:**
    - Setup Playwright for E2E testing.
    - Setup Bruno for API testing.

---

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

---

## v0.2.0: Core Task Model

This release defines the full data model that powers the entire application — tasks, sub-tasks, Someday groups, projects, and recurring tasks.

- [ ] **Task Model:** Define the complete `Task` type in `packages/shared` with all fields:
    - `id`, `text`, `notes` (markdown), `completed`, `date` (`null` = Someday), `createdAt`, `updatedAt`
    - `tags: string[]` — first-class tag system; priority is expressed as special tags (`#p1`, `#p2`, `#p3`)
    - `parentId: string | null` — enables nested sub-tasks
    - `rolloverEnabled: boolean` — per-task rollover override (default: `true`)
    - `someDayGroupId: string | null` — which Someday group this task belongs to
    - `projectId: string | null`, `position: number | null`, `state: 'ready' | 'scheduled' | 'done' | null`
    - `recurringTaskId: string | null`, `instanceDate: string | null`
    - `originalScheduledDate: string | null`, `daysLate: number`
    - `dependsOn: string | null`
- [ ] **SomeDayGroup Model:** Define `SomeDayGroup` — user-created tag-based groups in the Someday panel (`id`, `name`, `tag`, `position`, `createdAt`).
- [ ] **Project Model:** Define `Project` (`id`, `name`, `description`, `startDate`, `dueDate`, `isActive`, `createdAt`, `completedAt`).
- [ ] **RecurringTask Model:** Define `RecurringTask` template and `RecurringTaskStats` (`currentStreak`, `longestStreak`, `totalCompletions`, `lastCompletedDate`).
- [ ] **Task CRUD:** Implement Create, Read, Update, Delete in memory. All operations tested with unit tests.
- [ ] **Tag System:** Tags are plain strings stored on tasks. No separate Tag entity needed — tags are derived from task data.
- [ ] **Someday Support:** Tasks with `date: null` are unscheduled. `someDayGroupId` assigns them to a group.
- [ ] **Sub-task Support:** Tasks with `parentId` are sub-tasks. Completion of all sub-tasks rolls up to parent.

### Technical Notes & Considerations
- All models live in `packages/shared` to be used by client, server, CLI, and MCP packages.
- Priority (`#p1`, `#p2`, `#p3`) is just a tag convention — no separate priority field needed.
- The `tags` array is the primary organizational system across the entire app.
- `rolloverEnabled` defaults to `true` app-wide; the per-task field overrides the app setting.

### Definition of Done
- All models fully defined and exported from `packages/shared`.
- Full CRUD for tasks with unit tests.
- Sub-task parent/child relationship tested.
- Someday group assignment tested.
- Tag filtering logic tested (filter tasks by one or more tags).

---

## v0.3.0: API Endpoints

This release creates the REST API for all entities.

- [ ] **Task API:** Full CRUD endpoints for tasks, including filtering by date, tag, completion status, and Someday group.
- [ ] **SomeDayGroup API:** CRUD endpoints for managing Someday groups.
- [ ] **Project API:** CRUD endpoints for projects, plus activate/deactivate and task distribution.
- [ ] **RecurringTask API:** CRUD for recurring task templates; endpoint to generate instances for a date range.
- [ ] **Tag API:** Derive tags from task data; endpoint to list all tags, rename, merge.

### Technical Notes & Considerations
- RESTful design throughout.
- Zod for input validation on all endpoints.
- OpenAPI documentation generated and kept up to date.
- Bruno tests written before implementation (TDD).

### Definition of Done
- All endpoints implemented and tested with Bruno.
- OpenAPI documentation generated.
- Zod validation on all inputs.

---

## v0.4.0: Basic UI

This release builds the core three-panel layout and all fundamental task interactions.

### Layout
- [ ] **Four-zone layout:**
    - **Left icon rail** — slim vertical rail with icons that each open a large centered modal (background dims on open, `Esc` or click-outside closes). One modal open at a time.
    - **Center day list** — the primary working area; fills all space between the two panels.
    - **Right Someday panel** — always visible by default; collapsible via toggle button or keyboard shortcut; resizable by dragging the left divider edge; width saved to DB.
    - **Bottom bar** — state display and navigation only (see below).

### Left Icon Rail
Icons (all open centered modals):
- [ ] 📅 **Summary** — daily stats: completion %, overdue tasks, streaks, upcoming deadlines + holidays
- [ ] 📊 **Projects** — project list; click a project → Kanban modal (Ready | Scheduled | Done columns)
- [ ] 🔁 **Habits** — recurring task list with GitHub-style heatmaps; click → habit detail modal
- [ ] 📆 **Calendar** — date picker to jump the day list to any date
- [ ] 🔍 **Search / Cmd+K** — unified command palette: search tasks, add tasks, navigate, run actions, natural language input (e.g. `buy milk tomorrow #work #p1`); clicking a result scrolls day list to that task and closes modal
- [ ] 🏷️ **Filter** — full filter builder: tags, priority (`#p1`/`#p2`/`#p3`), date range, project, completion status; filters apply to day list and Someday simultaneously
- [ ] 🗑️ **Trash** — recently deleted tasks with restore; auto-purge after 7 days
- [ ] ⚙️ **Settings** — theme, rollover defaults, panel prefs, tag management, holidays, filter persistence, automation rules
- [ ] ❓ **Help** — keyboard shortcut reference organized by category

Active icon has a subtle highlight. Labels shown/hidden via Settings.

### Center Day List
- [ ] **Vertical scroll** of day sections, lazy loaded as the user scrolls (intersection observer).
- [ ] **Day section header:** `March 30, Sunday  •  4 tasks` + horizontal rule.
- [ ] **Holiday banners** displayed above day headers where applicable (managed in Settings > Holidays).
- [ ] **Task row:** `⠿ ○ text  #tags  #p1` — drag handle (⠿) on left, visible on hover; checkbox; text; tag chips; priority tag if present.
- [ ] **Sub-tasks:** always shown indented below their parent task.
- [ ] **Recurring task indicator:** subtle 🔁 icon after the task text.
- [ ] **Empty days** shown by default (user can hide in Settings).
- [ ] **App opens scrolled to today** with a subtle "Today" highlight; sticky `▲ Today` button appears when scrolled away from today.
- [ ] **`+ add task`** prompt at the bottom of each day section.

### Right Someday Panel
- [ ] Title "Someday" with collapse button (‹).
- [ ] `+ add group` button at top.
- [ ] Groups rendered identically to day sections (same task rows, same interactions).
- [ ] No rollover, no recurring instances.
- [ ] Global filter (🏷️) applies to Someday tasks simultaneously with the day list.

### Bottom Bar
- [ ] **Left:** `alle` logo — clicking clears all filters and snaps to today (home button).
- [ ] **Center-left:** active filter chips, each with `×` to dismiss; `[clear all]` when multiple filters active.
- [ ] **Center-right:** status — `12 tasks • 4 done`; when no filters: `March 30 • 12 tasks`.
- [ ] **Right:** `▲ Today` button (visible only when scrolled away from today).

### Task Interactions
- [ ] **Click text** → inline edit (Enter saves, Esc cancels).
- [ ] **`e` or detail icon** → floating task detail modal (text, notes/markdown, tags, date picker, sub-tasks, rollover toggle).
- [ ] **Space** → complete task; undo toast (5s) + Cmd+Z.
- [ ] **`d`** → delete task; undo toast (5s) + Cmd+Z. Behavior (instant vs confirm) configurable in Settings.
- [ ] **`n` or `a`** → inline add input appears at bottom of focused day section.
- [ ] **Drag (⠿ handle)** → drag between day sections; drag right to Someday (clears date); drag left from Someday onto a day header to schedule.

### Technical Notes & Considerations
- Built with SvelteKit + Tailwind CSS.
- Svelte stores for UI state (active filters, panel widths, scroll position).
- Optimistic updates for all task mutations.
- All new components developed in Storybook.

### Definition of Done
- All four zones render correctly.
- Full task CRUD through the UI.
- Inline editing, detail modal, and quick-add all functional.
- Someday panel functional with groups.
- Bottom bar reflects filter and task state.
- Storybook stories for all components.

---

## v0.5.0: Keyboard Navigation & Command Palette

This release makes Alle fully operable without a mouse.

- [ ] **Vim + arrow key navigation:** Both work simultaneously throughout the app.
    - `j`/`k` or `↑`/`↓` — navigate tasks within a day section
    - `J`/`K` — jump between day sections (or Someday groups)
    - `n`/`a` — add task to focused day/group
    - `e` — open task detail modal for focused task
    - `Space` — complete focused task
    - `d` — delete focused task
    - `Esc` — cancel edit / close modal
    - `g t` — jump to today
    - `Ctrl+\` — toggle Someday panel
    - `?` — open Help modal (keyboard shortcuts)
    - `Cmd+K` — open unified search/command palette
    - `Cmd+Z` — undo last action
- [ ] **Command palette (Cmd+K / 🔍):** Unified modal for everything.
    - Real-time task search across all tasks.
    - Natural language task creation: `buy milk tomorrow #work #p1`.
    - Navigation: `go to march 15`, `go to today`.
    - Actions: `complete fix auth bug`, `move write tests to friday`, `delete review PR`.
    - Selecting a result closes the palette and scrolls to that task's day.
- [ ] **Focus management:** Keyboard focus is always visible and predictable after every action.

### Technical Notes & Considerations
- A library like `mousetrap` or `hotkeys-js` for keybinding management.
- Natural language date parsing with a library like `chrono-node`.
- E2E tests for all keyboard flows.

### Definition of Done
- All UI elements reachable and operable via keyboard.
- Command palette handles search, add, navigate, and actions.
- Natural language date/tag/priority parsing works.
- E2E tests for keyboard navigation and command palette.

---

## v0.6.0: Drag-and-Drop

This release introduces drag-and-drop as a secondary interaction method.

- [ ] **Drag handle:** ⠿ grip icon appears on the left of each task row on hover. Only the handle initiates a drag.
- [ ] **Drag between days:** Drag a task from one day section and drop it onto another day's header or task list. The target day section highlights on hover.
- [ ] **Drag to Someday:** Drag a task rightward into the Someday panel. Task's `date` is cleared on drop (becomes unscheduled). Task lands in the first group or a highlighted group.
- [ ] **Drag from Someday:** Drag a task from the Someday panel leftward onto a specific day section header to schedule it. The target day highlights as the task hovers over it.
- [ ] **Visual feedback:** Ghost image while dragging; drop zone indicator; smooth animations.
- [ ] **Reorder within a day:** Drag tasks up/down within the same day section to reorder.

### Technical Notes & Considerations
- Evaluate `svelte-dnd-action` for drag-and-drop.
- Keyboard alternatives (move task with `m` + arrow keys) are covered in v0.5.0.
- E2E tests for all drag scenarios.

### Definition of Done
- All drag scenarios functional with visual feedback.
- Dragging to/from Someday correctly clears/sets dates.
- Reordering within a day persists.
- E2E tests passing.

---

## v0.7.0: Layout & Responsiveness

This release polishes the three-panel layout, implements lazy loading, view modes, and responsive behavior.

- [ ] **Lazy loading:** Day sections load on demand as the user scrolls using an intersection observer. Starts at today; loads past and future days as needed.
- [ ] **Panel resize & collapse:**
    - Left icon rail: fixed width, always visible.
    - Someday panel: resizable by dragging divider edge; collapsible via toggle button and `Ctrl+\`; width saved to DB.
    - Both panels handle gracefully on smaller viewports.
- [ ] **Priority view mode:** Accessible through the 🏷️ Filter modal as a sort option. When "Priority" sort is active, tasks within each day section are ordered `#p1` → `#p2` → `#p3` → untagged, with a subtle left-border accent per priority level.
- [ ] **Filter modal (🏷️):**
    - Full filter builder: tags (multi-select), priority level, date range, project, completion status.
    - Applies live as filters are selected.
    - Filter state shown as chips in the bottom bar.
    - Filter persistence: configurable in Settings (default: persist across sessions).
- [ ] **Tailwind CSS:** Adopt Tailwind CSS as the styling framework across all components.
- [ ] **Mobile:**
    - Day list fills full width.
    - Someday panel and icon rail modals accessible as bottom sheets.
    - Bottom bar always visible.
- [ ] **Responsive breakpoints:** Graceful degradation from desktop to tablet to mobile.

### Technical Notes & Considerations
- Intersection observer for lazy loading — avoid virtual scrolling unless performance requires it.
- CSS custom properties for theme tokens alongside Tailwind.
- Tailwind's JIT mode for optimal bundle size.
- E2E tests for responsive behavior and filter scenarios.

### Definition of Done
- Lazy loading functional with smooth scroll experience.
- Panel resize/collapse working and persisted.
- Priority sort mode functional.
- Filter modal with full filter builder working.
- Bottom bar reflects active filter state correctly.
- Mobile bottom sheet behavior functional.
- Tailwind adopted throughout.

---

## v0.8.0: I/O & Data

This release implements persistent storage and data export.

- [ ] **I/O Abstraction Layer:** Solidify the adapter pattern so the application core is independent of the data source.
- [ ] **In-Memory Adapter:** Already exists; keep for testing and ephemeral sessions.
- [ ] **SQLite Adapter:** Implement a file-based SQLite adapter as the first real persistence layer.
    - Zero-config for self-hosted use: single `.db` file on disk.
    - Schema migrations via a lightweight migration tool.
    - Supports all entities: tasks, sub-tasks, Someday groups, projects, recurring tasks, tags.
- [ ] **Configuration:** Select adapter via environment variable (`STORAGE_ADAPTER=sqlite|memory`).
- [ ] **Data Export:** One-click export of all data as structured JSON.
- [ ] **Data Import:** Import from a previously exported JSON file.

### Technical Notes & Considerations
- SQLite via `bun:sqlite` (built into Bun — no extra dependency).
- Keep PostgreSQL adapter for v2.3.0 when multi-user auth is added.
- Drizzle ORM is a good fit for both SQLite and PostgreSQL when the time comes.
- The export format should be documented and stable so users can rely on it.

### Definition of Done
- SQLite adapter fully implemented and tested.
- All in-memory tests pass against SQLite adapter too (adapter contract tests).
- Export/import round-trip tested.
- Configuration via environment variable working.

---

## v0.9.0: UI Polish & Theming

This release refines the visual design into a cohesive, calm, and beautiful product.

- [ ] **Design system:** Establish a consistent visual language using Tailwind + CSS custom properties.
    - Inspired by Basecamp: clean, spacious, warm, calm. No clutter.
    - Typography: a readable sans-serif for task text, monospace accents for dates and labels.
    - Spacing, border radius, shadow, and color scales defined as CSS variables.
- [ ] **Light & dark mode:**
    - System preference detected by default.
    - Manual toggle in ⚙️ Settings.
    - Light: warm off-white background, dark text, subtle borders.
    - Dark: deep charcoal background, light text, muted borders.
- [ ] **Tag colors:**
    - Tags are auto-assigned distinct pastel colors on creation.
    - User can override the color for any tag in Settings > Tags.
    - Tag chips in task rows and filter bar reflect the color.
- [ ] **Tag management screen** (in ⚙️ Settings):
    - List all tags with their colors.
    - Rename, merge (combine two tags), delete, recolor.
- [ ] **Animations & transitions:** Subtle and purposeful — task completion fade, modal open/close, panel collapse, drag ghost.
- [ ] **Storybook design review:** All components reviewed in Storybook against the design system.

### Technical Notes & Considerations
- Tailwind's dark mode with `class` strategy for manual toggle support.
- CSS custom properties for tokens that need to be dynamic (theme switching, tag colors).
- Svelte's built-in transition functions for animations.

### Definition of Done
- Light and dark themes fully implemented and polished.
- Tag colors auto-assigned and user-overridable.
- Tag management screen functional.
- Application has a calm, spacious, Basecamp-inspired feel throughout.
- All animations are smooth and purposeful.

---

## v0.10.0: Basic Automation

This release introduces the automation features that make Alle smart.

- [ ] **Task rollover:**
    - Incomplete tasks with `rolloverEnabled: true` automatically move to the next day.
    - `originalScheduledDate` is preserved; `daysLate` is calculated and displayed as an overdue badge.
    - App-wide rollover default configurable in ⚙️ Settings (on/off, trigger time: midnight / 9am / manual).
    - Per-task override via the task detail modal.
- [ ] **Recurring tasks:**
    - Recurring task instances are auto-generated from templates.
    - Generation window configurable in Settings (1 week, 2 weeks, 1 month ahead).
    - Instances appear in the day list with a 🔁 icon.
    - Completing an instance updates `RecurringTaskStats` (streak tracking: current streak, longest streak, total completions).
    - Missing a day breaks the streak.
- [ ] **Streak tracking:** Displayed on recurring tasks in the 🔁 Habits modal heatmap.

### Technical Notes & Considerations
- `rrule.js` for recurring date generation.
- Rollover can run as a background job on server start or via a cron expression.
- Streak calculation: check if yesterday's instance was completed when today's is completed.

### Definition of Done
- Rollover moves incomplete tasks and tracks `daysLate`.
- Recurring instances appear in the day list on the correct days.
- Streak statistics update correctly on completion and missed days.
- All automation logic has unit tests.
- Rollover settings configurable and respected.

---

## v0.11.0: Projects & Habits UI

This release builds the full UI for project management and habit tracking.

- [ ] **Projects modal (📊):**
    - List all projects (active and inactive).
    - Create/edit/delete projects with name, description, start date, due date.
    - **Project detail:** Kanban board with three columns — Ready, Scheduled, Done.
    - Drag tasks between columns.
    - Each scheduled task shows its assigned date.
    - [Activate] button runs the auto-distribution algorithm (spreads tasks across days between start and due date).
    - [Auto-distribute] shows a preview before confirming.
    - Dependency indicators: tasks blocked by incomplete predecessors show a lock icon.
    - Project tasks appear in the day list tagged with the project name (e.g., `#build-alle`).
- [ ] **Habits modal (🔁):**
    - List all recurring task templates with current streak and last completion date.
    - `+ new habit` flow: text + recurrence rule builder (presets: daily, weekly, monthly; custom rrule).
    - **Habit detail:** edit form + stats bar (current streak, longest streak, total completions) + GitHub-style completion heatmap.
    - Promote any existing task to recurring: toggle "Make recurring" in the task detail modal.
- [ ] **Summary modal (📅):**
    - Completion percentage for today.
    - List of overdue tasks with days-late count.
    - Active streaks for recurring tasks.
    - Upcoming hard deadlines (tasks tagged `#deadline`) and holidays within the next 14 days.
- [ ] **Calendar modal (📆):**
    - A date picker that jumps the day list to the selected date.
- [ ] **Holidays in Settings:**
    - Manual entry of named dates (name + date).
    - Optional `.ics` import via URL or file upload.
    - Holiday banners displayed above day section headers in the day list.

### Technical Notes & Considerations
- Kanban drag-and-drop reuses the drag infrastructure from v0.6.0.
- `rrule.js` recurrence rule builder for habit creation.
- `.ics` parsing with a library like `ical.js`.

### Definition of Done
- Projects modal fully functional with Kanban board.
- Auto-distribution algorithm working.
- Habits modal with heatmap and streak stats functional.
- Summary modal shows accurate daily overview.
- Calendar date picker jumps the day list correctly.
- Holidays appear as banners in the day list.
- "Make recurring" toggle in task detail modal works.

---

## v0.12.0: Markdown Notes

This release adds rich text support to task notes.

- [ ] **Markdown rendering:** Task notes (the `notes` field) are rendered as Markdown in the task detail modal.
    - Supports: headings, bold, italic, inline code, code blocks, lists, links.
    - Edit mode: raw Markdown textarea. View mode: rendered output. Toggle between modes.
- [ ] **Sanitization:** All user-provided HTML is sanitized before rendering to prevent XSS.

### Technical Notes & Considerations
- `marked` for Markdown parsing.
- `DOMPurify` for sanitization.

### Definition of Done
- Markdown rendered correctly in task detail modal.
- Edit/view toggle functional.
- XSS sanitization tested with adversarial inputs.

---

## v1.0.0: Public Release

The first stable, fully usable release of Alle. Goal: a complete daily driver for a single self-hosted user.

- [ ] **Feature complete:** All v0.x features integrated and working end-to-end.
- [ ] **SQLite persistence:** All data persists reliably across restarts.
- [ ] **Full keyboard operation:** Every action reachable without a mouse.
- [ ] **Command palette:** Search, add, navigate, and run actions via Cmd+K.
- [ ] **Projects & Habits:** Fully functional project Kanban and habit tracking with streaks.
- [ ] **Rollover automation:** Incomplete tasks roll over by default; overdue badges shown.
- [ ] **Tag system:** Full tag management — colors, rename, merge, delete.
- [ ] **Light & dark themes:** Polished and complete.
- [ ] **Markdown notes:** Rich notes in task detail.
- [ ] **Trash & undo:** 7-day trash, undo toasts, Cmd+Z.
- [ ] **Holidays:** Manual + .ics import; banners in day list.
- [ ] **Mobile:** Bottom sheet behavior for panels on small screens.
- [ ] **Dockerized:** A single `docker-compose up` starts the full application.
- [ ] **CI/CD pipeline:** Tests run on every push; Docker image built on release.
- [ ] **Performance:** Day list loads in <100ms; lazy loading keeps scroll smooth.

### Definition of Done
- Application is a fully usable, self-hosted daily task manager.
- Single user, no authentication required.
- All E2E tests passing.
- Biome checks passing.
- Docker deployment working.

---

## v2.0.0: CLI

Adds a full-featured command-line interface in a new `packages/cli` package.

- [ ] **Package setup:** `packages/cli` using Bun, communicates with the server over HTTP REST.
- [ ] **Command-based mode:**
    - `alle add "buy milk tomorrow #work #p1"` — natural language task creation
    - `alle list [--today] [--tag work] [--priority p1]` — list tasks
    - `alle complete <id|text>` — complete a task
    - `alle delete <id|text>` — delete a task
    - `alle someday add "learn Rust"` — add to Someday
    - `alle someday list` — list Someday tasks
    - `alle server start|stop|status` — control the server process
- [ ] **Interactive TUI mode:** Running `alle` with no arguments opens a terminal UI for navigating and managing tasks.
- [ ] **Natural language parsing:** Dates (today, tomorrow, next monday), tags (`#work`), priority (`#p1`), all parsed from free text.
- [ ] **Full parity:** Everything the web UI can do, the CLI can do.

### Definition of Done
- All commands functional and tested.
- TUI mode navigable with keyboard.
- Natural language parsing reliable.

---

## v2.1.0: MCP Server

Adds an MCP (Model Context Protocol) server in `packages/mcp` enabling AI-assisted task management.

- [ ] **Package setup:** `packages/mcp` exposing all Alle capabilities as MCP tools.
- [ ] **Core tools:** create/update/delete tasks, query tasks by date/tag/priority, manage Someday groups, manage projects, manage recurring tasks.
- [ ] **AI workflow support:**
    - **AI scheduling:** "Schedule all my `#work` tasks for next week" — AI distributes tasks across days.
    - **Daily briefing:** "What do I have today?" — summarizes tasks, overdue, streaks.
    - **Batch creation:** "Create a project with these 10 tasks: ..." — AI creates project + tasks at once.
    - **Smart triage:** "Which overdue tasks should I reschedule vs drop?" — AI helps decide.

### Definition of Done
- All MCP tools implemented and documented.
- AI scheduling and briefing workflows functional.

---

## v2.2.0: Notifications

Adds browser push and email reminders.

- [ ] **Per-task reminders:** Add `reminder: { time: string; channels: ('push' | 'email')[] }` to the Task model.
- [ ] **Browser push notifications:** Web Push API; user grants permission on first use.
- [ ] **Email reminders:** Configurable email provider (SMTP / SendGrid) in Settings.
- [ ] **App-wide defaults:** Default reminder time and channels configurable in ⚙️ Settings.
- [ ] **Notification management:** View, edit, and cancel scheduled reminders.

### Definition of Done
- Push and email reminders deliver reliably.
- Per-task and app-wide defaults work correctly.

---

## v2.3.0: Authentication

Adds multi-user support with passwordless authentication.

- [ ] **Passwordless auth:** Passkey (WebAuthn) as the primary method; magic link via email as fallback.
- [ ] **User accounts:** Registration, login, logout. Sessions managed with JWTs.
- [ ] **Data scoping:** All tasks, projects, groups, and settings are scoped per user.
- [ ] **Protected API:** All endpoints require a valid JWT. Middleware enforces data isolation.
- [ ] **PostgreSQL adapter:** Add a PostgreSQL persistence adapter (Drizzle ORM) to support multi-user at scale.

### Definition of Done
- Passkey and magic link login working.
- All data correctly scoped per user.
- PostgreSQL adapter tested and production-ready.

---

## v2.4.0: Advanced Automation

- [ ] **2-Day Rule:** Priority rises over time for recurring tasks not completed. Non-recurring tasks roll over to the next day.
- [ ] **Smart scheduling:** AI-assisted task distribution — suggests how to spread tasks based on capacity, deadlines, and priority.
- [ ] **Conditional tasks:** Set conditions on tasks (e.g., "complete X to unlock Y").
- [ ] **Capacity planning:** Set a daily task limit; auto-distribution respects it.

---

# 🎯 Vision: Unified Daily Task Management System

This section describes the full product vision that guides Alle's development.

## Core Philosophy

Alle is a unified task management system built around one simple idea: **you should only need one place to manage your work and your life**.

The daily list is the execution surface. Someday is the capture net. Projects and habits feed into the daily list automatically. Everything is organized with tags — the same tag system works across tasks, groups, Someday, and filters.

**Key principles:**
- One task type that appears differently depending on its attributes and context
- Tags as the primary organizational paradigm (including priority: `#p1`, `#p2`, `#p3`)
- Project tasks and recurring tasks feed into the daily list automatically — no manual re-entry
- Auto-rollover for incomplete tasks with "late" tracking
- Streak tracking for recurring habits
- A layout that gets out of your way: clean, calm, spacious, Basecamp-inspired

## Layout Overview

```
┌──┬──────────────────────────────────────────┬──────────────┐
│📅│                                          │  Someday   ‹ │
│📊│  [holiday: Easter 🐣]                    │  + add group │
│🔁│                                          │              │
│📆│  March 30, Sunday  •  4 tasks            │  #work       │
│🔍│  ─────────────────────────────────────  │  ─────────── │
│🏷️│  ⠿ ○ fix auth  #work  #p1              │  ⠿ ○ idea    │
│🗑️│       ○ unit tests                       │  ⠿ ○ thing   │
│⚙️│  ⠿ ○ write tests       #p2             │  + add task  │
│? │  + add task                              │              │
│  │                                          │  #school     │
│  │  March 31, Monday  •  2 tasks            │  ─────────── │
│  │  ─────────────────────────────────────  │  ⠿ ○ essay   │
│  │  ⠿ ○ deploy to prod   #p1              │              │
├──┴──────────────────────────────────────────┴──────────────┤
│  alle   #work ×  #p1 ×      12 tasks • 4 done   ▲ Today   │
└────────────────────────────────────────────────────────────┘
```

## Unified Data Model

```typescript
interface Task {
  id: string
  text: string
  notes: string | null              // markdown
  completed: boolean
  date: string | null               // null = Someday / unscheduled
  tags: string[]                    // #work, #p1, #build-alle, #deadline, etc.
  parentId: string | null           // nested sub-tasks
  rolloverEnabled: boolean          // per-task override; default: true
  someDayGroupId: string | null     // which Someday group

  projectId: string | null
  position: number | null
  state: 'ready' | 'scheduled' | 'done' | null

  recurringTaskId: string | null
  instanceDate: string | null

  originalScheduledDate: string | null
  daysLate: number
  dependsOn: string | null

  createdAt: string
  updatedAt: string
}

interface SomeDayGroup {
  id: string
  name: string
  tag: string | null
  position: number
  createdAt: string
}

interface Project {
  id: string
  name: string
  description: string | null
  startDate: string | null
  dueDate: string | null
  isActive: boolean
  createdAt: string
  completedAt: string | null
}

interface RecurringTask {
  id: string
  text: string
  recurrenceRule: string    // rrule.js format
  startDate: string
  endDate: string | null
  createdAt: string
}

interface RecurringTaskStats {
  recurringTaskId: string
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  lastCompletedDate: string | null
}
```

## Key Features

### Tag System
Tags are the primary organizational tool. A task can have any number of tags. Special tag conventions:
- `#p1`, `#p2`, `#p3` — priority levels
- `#deadline` — promoted in Summary modal
- `#project-name` — links task visually to a project
- `#habit-name` — useful for grouping recurring tasks

### Someday Panel
The right-side Someday panel captures ideas and unscheduled work. Tasks are organized into user-created groups (tag-based). Works identically to the day list but without dates or automation. Global filtering applies.

### Command Palette (Cmd+K)
One unified modal for search, add, navigate, and actions. Natural language: `buy milk tomorrow #work #p1`, `go to march 15`, `move fix auth to friday`. The fastest way to do anything in Alle.

### Project Management
Projects are collections of ordered tasks. When activated, tasks are auto-distributed across days between the project's start and due dates. Project tasks appear in the day list tagged with the project name.

### Habit Tracking
Recurring tasks generate daily instances automatically. Completing instances builds streaks. The Habits modal shows a GitHub-style heatmap of completion history per habit.

### Rollover
Incomplete tasks roll over to the next day by default. The `daysLate` counter tracks how overdue a task is. Configurable app-wide and per-task.

## Monorepo Structure

```
alle/
├── packages/
│   ├── client/   # SvelteKit frontend (Tailwind CSS)
│   ├── server/   # Bun REST API
│   ├── shared/   # Types, constants, universal adapters
│   ├── cli/      # alle CLI — command + TUI modes (v2.0.0)
│   └── mcp/      # MCP server for AI automation (v2.1.0)
├── docs/
├── tests/
└── package.json
```

## Persistence Strategy

| Phase | Adapter | When |
|-------|---------|------|
| Development | In-memory | v0.x |
| Self-hosted v1 | SQLite (bun:sqlite) | v0.8.0 |
| Multi-user v2 | PostgreSQL + Drizzle ORM | v2.3.0 |

## Success Metrics

**For users:**
- Can replace their current task system with Alle
- Daily list is the primary interface (>80% of time spent there)
- Streak lengths increase over time
- Late task count decreases over time

**Technical:**
- >85% test coverage
- <100ms response time for day list
- Zero data loss incidents
- All E2E tests passing
- Biome checks passing
