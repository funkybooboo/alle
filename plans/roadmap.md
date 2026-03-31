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

This release replaces the initial React client with a SvelteKit application.

- [x] **Scaffold SvelteKit App:** Create a new SvelteKit application in the `packages/client` directory.
- [x] **Setup Basic UI:** Re-create the basic UI for displaying tasks in Svelte.
- [x] **Ensure Feature Parity:** The Svelte client should have the same basic functionality as the original React client.

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
    - `startTime: string | null` — ISO 8601 time string (e.g. `"09:00"`); `null` = all-day task
    - `endTime: string | null` — ISO 8601 time string; `null` = all-day or open-ended
    - `reminder: { time: string; channels: ('push' | 'email')[] } | null` — stub field; implemented in v2.2.0
- [ ] **SomeDayGroup Model:** Define `SomeDayGroup` — user-created tag-based groups in the Someday panel (`id`, `name`, `description: string | null`, `tag`, `position`, `createdAt`).
- [ ] **Project Model:** Define `Project` (`id`, `name`, `description`, `startDate`, `dueDate`, `isActive`, `createdAt`, `completedAt`).
- [ ] **RecurringTask Model:** Define `RecurringTask` template and `RecurringTaskStats` (`currentStreak`, `longestStreak`, `totalCompletions`, `lastCompletedDate`).
- [ ] **UserPreferences Model:** Define `UserPreferences` entity — stores all user-configurable settings and UI state (panel widths, scroll position, active filters, theme, locale, etc.). Single-row entity for single-user mode; per-user in multi-user mode.
- [ ] **Task CRUD:** Implement Create, Read, Update, Delete in memory. All operations tested with unit tests (written before implementation).
- [ ] **Tag System:** Tags are plain strings stored on tasks. No separate Tag entity needed — tags are derived from task data.
- [ ] **Someday Support:** Tasks with `date: null` are unscheduled. `someDayGroupId` assigns them to a group.
- [ ] **Sub-task Support:** Tasks with `parentId` are sub-tasks. Completion of all sub-tasks rolls up to parent.

### Technical Notes & Considerations
- All models live in `packages/shared` to be used by client, server, CLI, and MCP packages.
- Priority (`#p1`, `#p2`, `#p3`) is just a tag convention — no separate priority field needed.
- The `tags` array is the primary organizational system across the entire app.
- `rolloverEnabled` defaults to `true` app-wide; the per-task field overrides the app setting.
- `startTime`/`endTime` are stored as time-only strings tied to the task's `date`. All-day tasks have both as `null`.
- The `reminder` field is defined here for type stability but the delivery infrastructure ships in v2.2.0.

### Documentation & ADRs
- ADR: tag-based priority convention vs. a dedicated priority field.
- ADR: why `startTime`/`endTime` are stored as time strings (not full timestamps).

### Definition of Done
- All models fully defined and exported from `packages/shared`.
- Full CRUD for tasks with unit tests (written first).
- Sub-task parent/child relationship tested.
- Someday group assignment tested.
- Tag filtering logic tested (filter tasks by one or more tags).
- `startTime`/`endTime` validation tested (must be valid time strings or null; `endTime` >= `startTime`).

---

## v0.3.0: API Endpoints

This release creates the REST API for all entities. The API is designed to be clean, well-documented, and accessible from both browsers and the command line (curl-friendly).

- [ ] **Schema-first OpenAPI:** Define the OpenAPI 3.1 spec first in `packages/server/openapi.yaml`. Generate Zod validators from the spec. Implement endpoints against the spec. The spec is the source of truth.
- [ ] **Task API:** Full CRUD endpoints for tasks, including filtering by date, tag, completion status, and Someday group.
- [ ] **SomeDayGroup API:** CRUD endpoints for managing Someday groups.
- [ ] **Project API:** CRUD endpoints for projects, plus activate/deactivate and task distribution.
- [ ] **RecurringTask API:** CRUD for recurring task templates; endpoint to generate instances for a date range.
- [ ] **Tag API:** Derive tags from task data; endpoint to list all tags, rename, merge.
- [ ] **UserPreferences API:** GET and PATCH endpoints for reading and updating user preferences.
- [ ] **Content negotiation (curl-friendly):** All endpoints inspect the `Accept` header:
    - `application/json` (or no header from a browser) → JSON response (default)
    - `text/plain` or absent `Accept` (curl default) → human-readable plain text response
    - Example: `GET /tasks/today` with `Accept: text/plain` returns a plain-text task list
- [ ] **Security headers:** All responses include:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Content-Security-Policy` (strict baseline; tightened in v2.4.0)
    - `Strict-Transport-Security` (HSTS; enforced in production)
- [ ] **Rate limiting:** Simple token-bucket rate limiter on all endpoints from day one. Configurable via environment variable.
- [ ] **Input validation:** Zod validators on all request bodies and query params, generated from the OpenAPI spec.
- [ ] **Export/Import adapter interfaces:** Define `ExportAdapter<T>` and `ImportAdapter<T>` interfaces in `packages/shared`. Implemented in v0.8.0.

### Technical Notes & Considerations
- RESTful design throughout. Consistent error response shape: `{ error: string; code: string; details?: unknown }`.
- Bruno tests written before implementation (TDD). Every endpoint has a Bruno test file.
- The OpenAPI spec is auto-served at `GET /openapi.yaml` and `GET /openapi.json`.
- Content negotiation uses the `accepts` library or equivalent.
- Rate limiting state lives in-memory for single-user; Redis-backed in v2 for multi-user scale.

### Documentation & ADRs
- ADR: schema-first OpenAPI approach (spec → validators → implementation).
- ADR: content negotiation strategy (curl-friendly plain text).
- Dev docs: API reference auto-generated from the OpenAPI spec.

### Security Considerations
- All inputs validated and sanitized at the API boundary.
- Security headers applied globally via middleware.
- Rate limiting prevents abuse even in single-user mode.

### Definition of Done
- All endpoints implemented and tested with Bruno (tests written first).
- OpenAPI spec complete and served at `/openapi.yaml`.
- Zod validation on all inputs.
- Content negotiation working: JSON and plain-text responses for all list endpoints.
- Security headers present on all responses.
- Rate limiting functional.

---

## v0.4.0: Basic UI

This release builds the core three-panel layout and all fundamental task interactions.

### Layout
- [ ] **Four-zone layout:**
    - **Left icon rail** — slim vertical rail with icons that each open a large centered modal (background dims on open, `Esc` or click-outside closes). One modal open at a time.
    - **Center day list** — the primary working area; fills all space between the two panels.
    - **Right Someday panel** — always visible by default; collapsible via toggle button or keyboard shortcut; resizable by dragging the left divider edge; width saved to `UserPreferences`.
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
- [ ] ❓ **Help** — keyboard shortcut reference organized by category; links to full Writebook docs at the bottom

Active icon has a subtle highlight. Labels shown/hidden via Settings.

### Center Day List
- [ ] **Vertical scroll** of day sections, lazy loaded as the user scrolls (intersection observer).
- [ ] **Day section header:** `March 30, Sunday  •  4 tasks` + horizontal rule.
- [ ] **Holiday banners** displayed above day headers where applicable (managed in Settings > Holidays).
- [ ] **Task row:** `⠿ ○ text  #tags  #p1` — drag handle (⠿) on left, visible on hover; checkbox; text; tag chips; priority tag if present. Tasks with `startTime` show the time inline (e.g. `09:00 fix auth`).
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
Layout: `alle logo | filter chips | task count | ▲ Today | docs ↗`

- [ ] **Left:** `alle` logo — clicking clears all filters and snaps to today (home button).
- [ ] **Center-left:** active filter chips, each with `×` to dismiss; `[clear all]` when multiple filters active.
- [ ] **Center-right:** status — `12 tasks • 4 done`; when no filters: `March 30 • 12 tasks`.
- [ ] **Right:** `▲ Today` button (visible only when scrolled away from today).
- [ ] **Far-right:** `docs ↗` link — opens the Writebook user docs in a new tab.

### Task Interactions
- [ ] **Click text** → inline edit (Enter saves, Esc cancels).
- [ ] **`e` or detail icon** → floating task detail modal (text, notes/markdown, tags, date picker, `startTime`/`endTime` fields, sub-tasks, rollover toggle).
- [ ] **Space** → complete task; undo toast (5s) + Cmd+Z.
- [ ] **`d`** → delete task; undo toast (5s) + Cmd+Z. Behavior (instant vs confirm) configurable in Settings.
- [ ] **`n` or `a`** → inline add input appears at bottom of focused day section.
- [ ] **Drag (⠿ handle)** → drag between day sections; drag right to Someday (clears date); drag left from Someday onto a day header to schedule.

### Technical Notes & Considerations
- Built with SvelteKit + Tailwind CSS.
- Svelte stores for UI state (active filters, panel widths, scroll position).
- Optimistic updates for all task mutations.
- All new components developed in Storybook.
- ARIA roles and labels applied to all interactive elements from the start — not retrofitted later.

### Documentation & ADRs
- User docs: "Getting started" and "Using the day list" written for this release.
- ADR: bottom bar layout and docs link placement.

### Definition of Done
- All four zones render correctly.
- Full task CRUD through the UI.
- Inline editing, detail modal, and quick-add all functional.
- Someday panel functional with groups.
- Bottom bar reflects filter and task state; docs link present and working.
- Storybook stories for all components.

---

## v0.5.0: Keyboard Navigation & Command Palette

This release makes Alle fully operable without a mouse, and finalizes the complete keyboard shortcut system.

### Complete Keyboard Shortcut Reference

**Navigation**
| Key | Action |
|-----|--------|
| `j` / `↓` | Focus next task |
| `k` / `↑` | Focus previous task |
| `J` | Jump to next day section / Someday group |
| `K` | Jump to previous day section / Someday group |
| `g t` | Jump to today |
| `g s` | Jump to Someday panel |

**Task Actions** (on focused task)
| Key | Action |
|-----|--------|
| `n` / `a` | Add new task to focused day/group |
| `e` | Open task detail modal |
| `Space` | Complete / uncomplete task |
| `d` | Delete task (undo toast) |
| `r` | Reschedule — open date picker inline |
| `m` | Move — opens day picker to move to another day |
| `1` | Set priority `#p1` |
| `2` | Set priority `#p2` |
| `3` | Set priority `#p3` |
| `0` | Clear priority |
| `t` | Open tag input on focused task |

**Panels & Modals**
| Key | Action |
|-----|--------|
| `Ctrl+\` | Toggle Someday panel |
| `Ctrl+]` | Toggle right control panel (future) |
| `Ctrl+[` | Collapse/expand left icon rail labels |
| `Cmd+K` | Open command palette |
| `?` | Open Help modal (keyboard shortcuts) |
| `Esc` | Cancel edit / close modal / clear focus |

**Undo / Redo**
| Key | Action |
|-----|--------|
| `Cmd+Z` | Undo last action |
| `Cmd+Shift+Z` | Redo |

### Command Palette (Cmd+K)

The palette has two modes distinguished by the first character:

**Search mode** (plain text — no `/` prefix):
- Fuzzy search across all tasks (title, tags, notes)
- Results ranked by recency and relevance
- Selecting a result closes the palette and scrolls day list to that task's day

**Command mode** (`/` prefix):
| Command | Action |
|---------|--------|
| `/add <natural language>` | Create task (e.g. `/add buy milk tomorrow #work #p1`) |
| `/complete <text>` | Complete a task matching the text |
| `/delete <text>` | Delete a task matching the text |
| `/move <text> to <date>` | Reschedule a task |
| `/go <date>` | Jump day list to a date (e.g. `/go march 15`, `/go next monday`) |
| `/tag <text> with <tag>` | Add a tag to a matching task |
| `/filter <tag>` | Apply a tag filter |
| `/clear` | Clear all active filters |
| `/today` | Jump to today |
| `/someday <text>` | Move a task to Someday |
| `/project <name>` | Open a project |
| `/habit <name>` | Open a habit |
| `/settings` | Open Settings |
| `/help` | Open Help modal |

- Natural language dates and tags parsed in both modes.
- The palette command list is extensible — new commands are registered by adding to the command registry in `packages/shared`.

### Additional Checklist
- [ ] Vim + arrow key navigation: both work simultaneously throughout the app.
- [ ] All shortcuts in the table above implemented and working.
- [ ] Command palette: search mode and command mode (`/` prefix) both functional.
- [ ] Natural language date parsing: today, tomorrow, next monday, march 15, in 3 days.
- [ ] Natural language task creation: `buy milk tomorrow #work #p1`.
- [ ] Focus management: keyboard focus always visible and predictable after every action.
- [ ] Focus trapped inside modals; Esc closes and returns focus to the trigger element.

### Technical Notes & Considerations
- `mousetrap` or `hotkeys-js` for keybinding management. Choose one — ADR it.
- `chrono-node` for natural language date parsing.
- Command registry pattern: commands are objects `{ prefix: string; description: string; handler: fn }` — makes the palette extensible.
- E2E tests for all keyboard flows (written before implementation).

### Documentation & ADRs
- ADR: keybinding library choice.
- ADR: `/` command prefix convention (inspired by Notion, Slack slash commands).
- User docs: full keyboard shortcut reference page (mirrors the table above).
- User docs: command palette guide with examples.

### Definition of Done
- All UI elements reachable and operable via keyboard.
- All shortcuts in the reference table functional.
- Command palette: search, command mode, natural language add/navigate all working.
- Focus management correct throughout.
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
- Keyboard alternatives (move task with `m` + date picker) are covered in v0.5.0.
- E2E tests for all drag scenarios (written before implementation).
- Ensure drag interactions are not the only way to accomplish any action (accessibility).

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
    - Someday panel: resizable by dragging divider edge; collapsible via toggle button and `Ctrl+\`; width saved to `UserPreferences`.
    - Both panels handle gracefully on smaller viewports.
- [ ] **Priority view mode:** Accessible through the 🏷️ Filter modal as a sort option. When "Priority" sort is active, tasks within each day section are ordered `#p1` → `#p2` → `#p3` → untagged, with a subtle left-border accent per priority level.
- [ ] **Filter modal (🏷️):**
    - Full filter builder: tags (multi-select), priority level, date range, project, completion status.
    - Applies live as filters are selected.
    - Filter state shown as chips in the bottom bar.
    - Filter persistence: configurable in Settings (default: persist across sessions in `UserPreferences`).
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

## v0.8.0: Persistence & Data I/O

This release implements persistent storage, multi-format data export, and import from popular task managers.

### Storage
- [ ] **I/O Abstraction Layer:** Solidify the adapter pattern so the application core is independent of the data source.
- [ ] **In-Memory Adapter:** Already exists; keep for testing and ephemeral sessions.
- [ ] **SQLite Adapter:** Implement a file-based SQLite adapter as the first real persistence layer.
    - Zero-config for self-hosted use: single `.db` file on disk.
    - Schema migrations via a lightweight migration tool.
    - Supports all entities: tasks, sub-tasks, Someday groups, projects, recurring tasks, tags, `UserPreferences`.
- [ ] **Configuration:** Select adapter via environment variable (`STORAGE_ADAPTER=sqlite|memory`).
- [ ] **Adapter contract tests:** The same test suite runs against both in-memory and SQLite adapters to ensure behavioral parity.

### State Persistence
- [ ] **`UserPreferences` entity persisted in SQLite.** Covers:
    - Panel widths (Someday panel, future panels)
    - Last scroll position / last visited date
    - Active filters (if filter persistence is enabled in Settings)
    - Theme preference (light/dark/system)
    - Locale setting
    - All behavioral toggles (rollover, completion animation, delete confirmation, etc.)

### Export
- [ ] **JSON** — canonical format; lossless round-trip. All entities included.
- [ ] **CSV** — flat task list; configurable columns (text, date, tags, priority, completed, notes).
- [ ] **Markdown** — task list as `- [ ] text #tags` per line, grouped by date.
- [ ] **iCal / .ics** — tasks with `startTime`/`endTime` exported as VEVENT; all-day tasks as all-day VEVENT.

### Import
- [ ] **JSON** — restore from a previous export.
- [ ] **CSV** — generic task CSV with column mapping UI.
- [ ] **iCal / .ics** — parse VEVENT entries into tasks; sets `date`, `startTime`, `endTime`. Works with Google Calendar, Apple Calendar, Outlook exports.
- [ ] **Todoist CSV** — map Todoist's export columns to Alle task fields.
- [ ] **Things 3 JSON** — map Things 3 export format to Alle task fields.

### Interfaces
- [ ] **`ExportAdapter<T>`** interface in `packages/shared` — implement one adapter per format.
- [ ] **`ImportAdapter<T>`** interface in `packages/shared` — implement one adapter per format.

### Technical Notes & Considerations
- SQLite via `bun:sqlite` (built into Bun — no extra dependency).
- Keep PostgreSQL adapter for v2.3.0 when multi-user auth is added.
- Drizzle ORM is a good fit for both SQLite and PostgreSQL.
- The JSON export format is documented and stable — users can rely on it for backups.
- Import UI: a file picker in ⚙️ Settings > Import/Export with format selection and column mapping for CSV.
- All import adapters are tested with real export files from the source apps.

### Documentation & ADRs
- ADR: why SQLite before PostgreSQL (self-hosted simplicity).
- ADR: export format stability commitment (JSON as canonical).
- User docs: import/export guide with format descriptions and step-by-step instructions.
- Dev docs: `ExportAdapter` and `ImportAdapter` interface contracts.

### Security Considerations
- Import files are validated before processing; malformed files return clear errors.
- Markdown and notes fields sanitized on import (DOMPurify).

### Definition of Done
- SQLite adapter fully implemented and tested.
- All adapter contract tests pass against both in-memory and SQLite.
- Export working for all four formats.
- Import working for all five sources.
- `UserPreferences` persisted across restarts.
- Import/Export UI in Settings functional.

---

## v0.9.0: Automation

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
- All automation logic has unit tests written before implementation.

### Definition of Done
- Rollover moves incomplete tasks and tracks `daysLate`.
- Recurring instances appear in the day list on the correct days.
- Streak statistics update correctly on completion and missed days.
- All automation logic has unit tests.
- Rollover settings configurable and respected.

---

## v0.10.0: Projects & Habits

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
- `.ics` parsing with a library like `ical.js` (shared with v0.8.0 iCal adapter).

### Definition of Done
- Projects modal fully functional with Kanban board.
- Auto-distribution algorithm working.
- Habits modal with heatmap and streak stats functional.
- Summary modal shows accurate daily overview.
- Calendar date picker jumps the day list correctly.
- Holidays appear as banners in the day list.
- "Make recurring" toggle in task detail modal works.

---

## v0.11.0: Markdown Notes

This release adds rich text support to task notes.

- [ ] **Markdown rendering:** Task notes (the `notes` field) are rendered as Markdown in the task detail modal.
    - Supports: headings, bold, italic, inline code, code blocks, lists, links.
    - Edit mode: raw Markdown textarea. View mode: rendered output. Toggle between modes.
- [ ] **Sanitization:** All user-provided HTML is sanitized before rendering to prevent XSS.

### Technical Notes & Considerations
- `marked` for Markdown parsing.
- `DOMPurify` for sanitization.
- XSS sanitization tested with adversarial inputs as part of TDD.

### Security Considerations
- All rendered Markdown is run through DOMPurify before insertion into the DOM.
- Content Security Policy prevents inline script execution even if sanitization is bypassed.

### Definition of Done
- Markdown rendered correctly in task detail modal.
- Edit/view toggle functional.
- XSS sanitization tested with adversarial inputs.

---

## v0.12.0: UI Polish, Theming & Customization

This release refines the visual design into a cohesive, calm product and formalizes all user-configurable preferences into a complete Settings experience.

### Design System & Theming
- [ ] **Design system:** Establish a consistent visual language using Tailwind + CSS custom properties.
    - Inspired by Basecamp: clean, spacious, warm, calm. No clutter.
    - Typography: a readable sans-serif for task text, monospace accents for dates and labels.
    - Spacing, border radius, shadow, and color scales defined as CSS variables.
    - Design tokens documented in Storybook.
- [ ] **Theme system:** Light, dark, and system default. Optional accent color schemes (e.g., warm, cool, high-contrast). All stored in `UserPreferences`.
- [ ] **Tag colors:**
    - Tags are auto-assigned distinct pastel colors on creation.
    - User can override the color for any tag in Settings > Tags.
    - Tag chips in task rows and filter bar reflect the color.
- [ ] **Tag management screen** (in ⚙️ Settings):
    - List all tags with their colors.
    - Rename, merge (combine two tags), delete, recolor.
- [ ] **Animations & transitions:** Subtle and purposeful — task completion fade, modal open/close, panel collapse, drag ghost.
- [ ] **Visual consistency audit:** Every modal, panel, form, and interaction reviewed against the design system. No orphaned styles.
- [ ] **Storybook design review:** All components reviewed in Storybook against the design system.

### User Preferences (Settings)
- [ ] **Font size:** Small, medium (default), large. Adjusts `--font-size-base` CSS variable globally.
- [ ] **Task row density:** Compact (tight spacing) vs comfortable (spacious, default).
- [ ] **Completion animation:** Configurable — strikethrough+fade, stay grayed, or hide immediately.
- [ ] **Delete behavior:** Instant + 5s undo toast (default) vs require confirmation dialog.
- [ ] **Rollover defaults:** App-wide on/off, trigger time (midnight / 9am / manual).
- [ ] **Empty day visibility:** Show empty days (default) vs hide.
- [ ] **Filter persistence:** Persist active filters across sessions (default) vs always start fresh.
- [ ] **Panel defaults:** Someday panel default open/closed. Icon rail labels shown/hidden.
- [ ] **Custom keyboard shortcuts:** User can remap any shortcut via Settings > Keyboard. Overrides stored in `UserPreferences`. Conflicts shown with a warning.
- [ ] **All preferences persisted** in `UserPreferences` (SQLite). Survive restarts, browser refreshes, and re-logins.

### Privacy Principle
- No analytics, no telemetry, no tracking — not even anonymized. Alle knows nothing about how you use it except what you explicitly store in your own database.
- Document this commitment explicitly in the user docs.

### Technical Notes & Considerations
- Tailwind's dark mode with `class` strategy for manual toggle support.
- CSS custom properties for tokens that need to be dynamic (theme switching, tag colors).
- Svelte's built-in transition functions for animations.

### Documentation & ADRs
- ADR: design system approach (Tailwind + CSS custom properties).
- ADR: `UserPreferences` schema and persistence strategy.
- Dev docs: design system reference (tokens, typography, spacing).
- User docs: full Settings reference.

### Definition of Done
- Light, dark, and system themes fully implemented and polished.
- Accent color schemes functional.
- Tag colors auto-assigned and user-overridable.
- Tag management screen functional.
- All preference categories implemented, functional, and persisted.
- Custom keyboard shortcut remapping working.
- Application has a calm, spacious, Basecamp-inspired feel throughout.
- All animations are smooth and purposeful.
- Visual consistency audit passed.
- Privacy principle documented in user docs.

---

## v0.13.0: Accessibility

This release ensures Alle meets WCAG 2.1 Level AA accessibility standards across every surface.

- [ ] **Full keyboard operability:** Every action reachable via keyboard (prerequisite: v0.5.0). Audit confirms no mouse-only interactions remain.
- [ ] **ARIA roles and labels:** All interactive elements (buttons, inputs, modals, drag handles) have correct ARIA attributes.
- [ ] **Screen reader testing:** Manually tested with NVDA (Windows) and VoiceOver (macOS/iOS). Key flows: add task, complete task, navigate day list, open command palette.
- [ ] **Focus management:**
    - Always visible focus ring throughout (no `outline: none` without a custom visible replacement).
    - Logical tab order in all panels.
    - Modals: focus trapped inside; Esc closes and returns focus to the trigger element.
- [ ] **Color contrast:** All text meets 4.5:1 ratio (normal text) and 3:1 ratio (large text) in both light and dark themes. Automated check in CI with `axe-core`.
- [ ] **Reduced motion:** Respect `prefers-reduced-motion`. All animations disabled or minimized when the user has set this OS preference.
- [ ] **Skip-to-content link:** Visible on first Tab keypress; skips the icon rail and jumps to the day list.
- [ ] **Form inputs:** All inputs have associated `<label>` elements. Error states are announced to screen readers via `aria-live`.
- [ ] **Automated a11y CI check:** `axe-core` integrated into the Playwright E2E suite. Every page/modal/component checked on each test run.

### Technical Notes & Considerations
- `axe-core` + `@axe-core/playwright` for automated accessibility testing.
- Manual screen reader testing is required for full coverage — automation only catches ~30–40% of issues.
- Retrofit any a11y debt accumulated in earlier releases.

### Documentation & ADRs
- ADR: WCAG 2.1 AA as the accessibility standard. Tooling: axe-core.
- User docs: accessibility guide (keyboard navigation, screen reader support, reduced motion).

### Definition of Done
- axe-core reports zero violations across all pages and components in CI.
- Manual screen reader test passes for core workflows (NVDA + VoiceOver).
- Color contrast audit passes (all text meets AA ratios).
- `prefers-reduced-motion` respected throughout.
- Focus management correct in all modals and panels.

---

## v0.14.0: Internationalization

This release adds infrastructure for multiple languages and locale-aware formatting.

- [ ] **`I18nAdapter` interface** defined in `packages/shared`. Pluggable locale providers implement it.
- [ ] **String extraction:** All user-facing strings extracted into locale files (`locales/en.json` as the canonical source). No hardcoded strings in components.
- [ ] **Default locale:** English (`en`). All existing strings catalogued and placed in `en.json`.
- [ ] **Locale selection:** ⚙️ Settings > Language dropdown. Selected locale stored in `UserPreferences`.
- [ ] **Date/time formatting:** Locale-aware using the `Intl` API. Day section headers, task dates, and times respect the selected locale.
- [ ] **Number formatting:** Task counts and stats use `Intl.NumberFormat`.
- [ ] **RTL layout architecture:** CSS layout is RTL-ready (logical properties: `margin-inline-start` not `margin-left`). No RTL language ships in this release, but adding one requires only a locale file and `dir="rtl"` on `<html>`.
- [ ] **Pluralization:** Plural forms handled correctly (e.g. "1 task" vs "2 tasks") via the i18n library.

### Technical Notes & Considerations
- Recommended library: `paraglide-js` (compile-time i18n, zero runtime overhead) or `svelte-i18n`.
- Locale files are JSON. Community translations contributed via pull requests.
- Only `en` ships in v0.14.0. Other languages added in subsequent releases as community contributions.

### Documentation & ADRs
- ADR: i18n library choice and locale file format.
- Dev docs: how to add a new language (locale file format, contribution guide).
- User docs: how to change the language in Settings.

### Definition of Done
- All user-facing strings in locale files. Zero hardcoded UI strings.
- Locale switching functional in Settings.
- Date/time formatting locale-aware.
- RTL layout using logical CSS properties throughout.
- Locale files validated in CI (no missing keys).

---

## v0.15.0: Calendar Time-Grid View

This release adds a time-grid calendar view for tasks with start and end times.

- [ ] **View toggle:** The 📆 Calendar rail icon now offers two modes: `List` (the existing day list) and `Calendar` (time grid). Toggle saved to `UserPreferences`.
- [ ] **Day view:** A 24-hour vertical time grid for a single day. Tasks with `startTime`/`endTime` appear as time-block cards. All-day tasks appear in a row above the grid.
- [ ] **Week view:** Seven-column time grid (Mon–Sun). Same block display.
- [ ] **Quick-add from grid:** Click any time slot → inline input with that time pre-filled → creates a task with `startTime` set.
- [ ] **Drag to reschedule:** Drag a time block to a new slot or day. Updates `date`, `startTime`, `endTime` on drop.
- [ ] **Resize to change duration:** Drag the bottom edge of a block to change `endTime`.
- [ ] **All-day tasks:** Tasks without `startTime`/`endTime` appear in the all-day row; can be dragged onto the grid to add a time.

### Technical Notes & Considerations
- Evaluate a SvelteKit-compatible calendar grid library or build a bespoke grid using CSS grid.
- Reuse drag infrastructure from v0.6.0 where possible.
- Keyboard navigation within the time grid: arrow keys move between time slots; Enter to add task.

### Definition of Done
- Day and week time-grid views functional.
- Time-block tasks display, drag-to-reschedule, and resize all working.
- Quick-add from time slot working.
- View toggle persisted.
- All-day task row functional.

---

## v1.0.0: Public Release

The first stable, fully usable release of Alle. Goal: a complete daily driver for a single self-hosted user.

- [ ] **Feature complete:** All v0.x features integrated and working end-to-end.
- [ ] **SQLite persistence:** All data persists reliably across restarts.
- [ ] **Full keyboard operation:** Every action reachable without a mouse. All shortcuts from v0.5.0 working.
- [ ] **Command palette:** Search, commands (`/` prefix), natural language add/navigate all functional.
- [ ] **Projects & Habits:** Fully functional project Kanban and habit tracking with streaks.
- [ ] **Rollover automation:** Incomplete tasks roll over by default; overdue badges shown.
- [ ] **Tag system:** Full tag management — colors, rename, merge, delete.
- [ ] **Light & dark themes:** Polished and complete.
- [ ] **Markdown notes:** Rich notes in task detail.
- [ ] **Trash & undo:** 7-day trash, undo toasts, Cmd+Z.
- [ ] **Holidays:** Manual + .ics import; banners in day list.
- [ ] **Import/Export:** JSON, CSV, Markdown, iCal, Todoist CSV, Things 3 JSON all working.
- [ ] **Start/end times:** Task model and detail modal support time fields. Calendar time-grid view functional.
- [ ] **Accessibility:** WCAG 2.1 AA audit passed. axe-core CI check green.
- [ ] **Internationalization:** All strings in locale files; locale switching functional.
- [ ] **User customization:** All preferences functional and persisted.
- [ ] **Docs link:** Bottom bar docs link working; Writebook user docs live and linked.
- [ ] **Help modal:** All keyboard shortcuts documented and accurate.
- [ ] **Mobile:** Bottom sheet behavior for panels on small screens.
- [ ] **Dockerized:** A single `docker-compose up` starts the full application.
- [ ] **CI/CD pipeline:** Tests run on every push; Docker image built on release.
- [ ] **Security headers:** All API responses include security headers.
- [ ] **ADRs:** Written for all significant decisions made during v0.x.
- [ ] **Performance:** Day list loads in <100ms; lazy loading keeps scroll smooth.

### Definition of Done
- Application is a fully usable, self-hosted daily task manager.
- Single user, no authentication required.
- All E2E and unit tests passing.
- Biome checks passing.
- Docker deployment working.
- User docs live on Writebook.

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
    - All commands support `--format json|plain|csv` for output formatting
- [ ] **Interactive TUI mode:** Running `alle` with no arguments opens a terminal UI for navigating and managing tasks.
    - TUI mirrors the web keyboard shortcuts exactly (same shortcut table from v0.5.0).
    - Vim keys (`j`/`k`/`J`/`K`), `e`, `d`, `Space`, `n`, `?` all work identically.
- [ ] **Natural language parsing:** Dates (today, tomorrow, next monday), tags (`#work`), priority (`#p1`), all parsed from free text.
- [ ] **Full parity:** Everything the web UI can do, the CLI can do.

### Definition of Done
- All commands functional and tested.
- TUI mode navigable with keyboard; shortcuts match web UI.
- Natural language parsing reliable.
- `--format` flag working for json/plain/csv output.

---

## v2.1.0: MCP Server

Adds an MCP (Model Context Protocol) server in `packages/mcp` enabling AI-assisted task management.

**Design principle: No AI in the UI.** The web UI, CLI command mode, and TUI contain zero AI features. AI automation is exclusively available via this MCP server and the CLI. This keeps the UI fast, deterministic, and distraction-free.

- [ ] **Package setup:** `packages/mcp` exposing all Alle capabilities as MCP tools.
- [ ] **Core tools:** create/update/delete tasks, query tasks by date/tag/priority, manage Someday groups, manage projects, manage recurring tasks.
- [ ] **AI workflow support** (MCP-only — not in the web UI):
    - **AI scheduling:** "Schedule all my `#work` tasks for next week" — AI distributes tasks across days.
    - **Daily briefing:** "What do I have today?" — summarizes tasks, overdue, streaks.
    - **Batch creation:** "Create a project with these 10 tasks: ..." — AI creates project + tasks at once.
    - **Smart triage:** "Which overdue tasks should I reschedule vs drop?" — AI helps decide.

### Documentation & ADRs
- ADR: No AI in the UI — all AI automation via MCP and CLI only.

### Definition of Done
- All MCP tools implemented and documented.
- AI scheduling and briefing workflows functional.

---

## v2.2.0: Notifications

Adds browser push and email reminders.

- [ ] **Per-task reminders:** `reminder: { time: string; channels: ('push' | 'email')[] }` field (stubbed in v0.2.0) is now live.
- [ ] **Browser push notifications:** Web Push API; user grants permission on first use.
- [ ] **Email reminders:** Configurable email provider via `EmailAdapter` interface (SMTP / Resend / Postmark). Selected and configured in ⚙️ Settings.
- [ ] **App-wide defaults:** Default reminder time and channels configurable in ⚙️ Settings.
- [ ] **Notification management:** View, edit, and cancel scheduled reminders.

### Technical Notes & Considerations
- `EmailAdapter` interface in `packages/shared`; adapters for SMTP, Resend, Postmark implement it.
- Background job (cron) on the server checks for upcoming reminders and dispatches them.

### Definition of Done
- Push and email reminders deliver reliably.
- Per-task and app-wide defaults work correctly.
- `EmailAdapter` interface documented for custom implementations.

---

## v2.3.0: Authentication

Adds multi-user support with passwordless authentication.

- [ ] **Passwordless auth:** Passkey (WebAuthn) as the primary method; magic link via email as fallback.
- [ ] **User accounts:** Registration, login, logout. Sessions managed with short-lived JWTs (15 min) + refresh tokens (30 days).
- [ ] **Data scoping:** All tasks, projects, groups, settings, and `UserPreferences` are scoped per user.
- [ ] **Protected API:** All endpoints require a valid JWT. Middleware enforces data isolation.
- [ ] **PostgreSQL adapter:** Add a PostgreSQL persistence adapter (Drizzle ORM) to support multi-user at scale.

### Security Requirements
- Passkeys stored per FIDO2 spec. No password is ever stored.
- Magic links: short-lived (15 min), single-use, HTTPS-only.
- JWTs stored in httpOnly, Secure, SameSite=Strict cookies — not localStorage.
- Refresh token rotation: a new refresh token is issued on every use; old token invalidated.
- CSRF protection via SameSite cookie + custom header check.

### Privacy / Data Minimization
- Only store what auth requires: email (for magic links), passkey credentials, session tokens.
- No real name, no phone number, no profile picture.
- Account deletion purges all user data immediately (tasks, settings, tokens).
- GDPR-ready from day one.

### Definition of Done
- Passkey and magic link login working.
- All data correctly scoped per user.
- JWT + refresh token flow with rotation working.
- PostgreSQL adapter tested and production-ready.
- Data deletion tested end-to-end.

---

## v2.4.0: Security Hardening

A dedicated security audit and hardening release. Runs before SaaS billing to ensure the platform is secure before accepting payment and managing multiple users' data.

- [ ] **OWASP Top 10 audit:** Systematic review of all endpoints against the OWASP Top 10. Findings documented and remediated.
- [ ] **Dependency scanning:** `osv-scanner` (or equivalent) integrated into CI. Zero known-vulnerable dependencies in production.
- [ ] **Secrets scanning:** `git-secrets` or `trufflehog` pre-commit hook and CI check. Historical git scan on first run.
- [ ] **CSP hardening:** Content Security Policy tightened to the minimum required set of directives. Subresource integrity on all external assets.
- [ ] **Audit logging:** All write operations logged with user ID, timestamp, and action. Logs stored separately from application data.
- [ ] **Brute-force protection:** Account lockout after N failed auth attempts. Rate limiting on auth endpoints (stricter than general API rate limit).
- [ ] **CORS:** Locked down to explicit origin allowlist in production. Wildcard `*` never used.
- [ ] **Threat model document:** Written and stored in `docs/security/threat-model.md`. Covers trust boundaries, attack surfaces, and mitigations.

### Documentation & ADRs
- ADR: threat model and key security decisions (session storage, token lifetimes, CORS policy).
- Dev docs: security model overview, how to run the dependency scanner, how to interpret audit logs.

### Definition of Done
- OWASP Top 10 audit complete; all high/critical findings remediated.
- Dependency scanner green in CI.
- Secrets scanner in pre-commit hook and CI.
- Audit logging functional.
- Threat model document written.

---

## v2.5.0: SaaS & Billing

Alle is open-source — anyone can self-host for free. This release adds optional managed hosting with Stripe billing for users who prefer not to self-host.

- [ ] **Managed hosting:** Creator's instance available at a public URL. Onboarding flow: sign up → choose plan → Stripe Checkout → access app.
- [ ] **`PaymentAdapter` interface** in `packages/server`. Stripe adapter implements it. Self-hosted deployments can swap in a no-op adapter.
- [ ] **`BILLING_ENABLED` env var:** Set to `false` on self-hosted instances to disable all billing code paths. Billing is completely inert when disabled.
- [ ] **Stripe integration:**
    - Stripe Checkout for subscription sign-up (monthly and yearly plans).
    - Stripe Customer Portal for plan changes, cancellation, and payment method management.
    - Webhook handling for subscription lifecycle: `created`, `updated`, `cancelled`, `payment_failed`.
    - Stripe webhook signature verification on all incoming events.
- [ ] **Free tier:** Defined limits (e.g., up to N tasks, no recurring tasks, no notifications). Paid tier: unlimited.
- [ ] **Billing UI** in ⚙️ Settings (visible on managed hosting only):
    - Current plan and renewal date.
    - Upgrade / downgrade / cancel flow (via Stripe Customer Portal redirect).
    - Invoice history.
- [ ] **Transactional email** (extends `EmailAdapter` from v2.2.0):
    - Magic link auth emails.
    - Subscription receipts and payment failure notices.
    - Plan change confirmations.

### Security Considerations
- Stripe webhook signature verified on every event.
- No card data ever touches our server — all payment handling is Stripe-side.
- Subscription state is stored locally (plan, status, Stripe customer ID) — nothing sensitive.

### Documentation & ADRs
- ADR: open-core model (open-source self-host + managed paid tier).
- ADR: Stripe as the payment provider.
- User docs: pricing and billing FAQ.
- Dev docs: how to disable billing for self-hosted deployments.

### Definition of Done
- Stripe Checkout and Customer Portal flows working end-to-end.
- Webhook lifecycle events handled correctly.
- Free tier limits enforced.
- `BILLING_ENABLED=false` completely disables billing with no side effects.
- Self-hosted Docker deployment unaffected by billing code.

---

## v2.6.0: Advanced Automation

- [ ] **2-Day Rule:** Priority rises over time for recurring tasks not completed. Non-recurring tasks roll over to the next day.
- [ ] **Smart scheduling (MCP-only):** AI-assisted task distribution — suggests how to spread tasks based on capacity, deadlines, and priority. Available via MCP server; not surfaced in the web UI.
- [ ] **Conditional tasks:** Set conditions on tasks (e.g., "complete X to unlock Y").
- [ ] **Capacity planning:** Set a daily task limit; auto-distribution respects it.

---

## v2.7.0: Canvas LMS Integration

Pull assignments and due dates from a Canvas LMS instance into Alle.

- [ ] **`CanvasCalendarAdapter`** implementing the `ImportAdapter` interface.
- [ ] **Configuration** in ⚙️ Settings: Canvas instance URL + API token (stored encrypted in the database).
- [ ] **Sync behavior:** One-way pull only (Canvas → Alle). Creates scheduled tasks from Canvas assignments: title, due date, course name as a tag (e.g. `#cs-101`).
- [ ] **Scheduled auto-sync:** Configurable interval (e.g., every hour, every day) or manual pull via a "Sync now" button in Settings.
- [ ] **Deduplication:** Canvas assignment ID stored on imported tasks. Re-syncing does not create duplicates.
- [ ] **Update handling:** If an assignment's due date changes in Canvas, the corresponding task's date is updated on next sync.

### Technical Notes & Considerations
- Canvas REST API is public and well-documented. OAuth or API token auth.
- Requires background job infrastructure (available from v2.x).
- User-scoped Canvas token storage requires auth (v2.3.0 prerequisite).

### Security Considerations
- Canvas API token stored encrypted (not plaintext) in the database.
- Token never logged or exposed in API responses.

### Definition of Done
- Canvas assignments imported with correct date, title, and course tag.
- Deduplication prevents double-imports.
- Auto-sync configurable and functional.
- Canvas token stored encrypted.
