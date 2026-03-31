# Product Design

This document describes the full product vision and design of Alle — the layout, data model, key features, and architectural decisions that define what it is and how it works.

---

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
- **No AI in the UI** — AI automation lives exclusively in the MCP server and CLI
- **Privacy first** — no analytics, no telemetry, minimal user data stored

---

## Layout Overview

```
┌──┬──────────────────────────────────────────┬──────────────┐
│📅│                                          │  Someday   ‹ │
│📊│  [holiday: Easter 🐣]                    │  + add group │
│🔁│                                          │              │
│📆│  March 30, Sunday  •  4 tasks            │  #work       │
│🔍│  ─────────────────────────────────────  │  ─────────── │
│🏷️│  ⠿ ○ 09:00 fix auth  #work  #p1        │  ⠿ ○ idea    │
│🗑️│       ○ unit tests                       │  ⠿ ○ thing   │
│⚙️│  ⠿ ○ write tests       #p2             │  + add task  │
│? │  + add task                              │              │
│  │                                          │  #school     │
│  │  March 31, Monday  •  2 tasks            │  ─────────── │
│  │  ─────────────────────────────────────  │  ⠿ ○ essay   │
│  │  ⠿ ○ deploy to prod   #p1              │              │
├──┴──────────────────────────────────────────┴──────────────┤
│  alle   #work ×  #p1 ×    12 tasks • 4 done  ▲ Today  docs↗│
└────────────────────────────────────────────────────────────┘
```

Four zones:
- **Left icon rail** — slim vertical rail; each icon opens a large centered modal
- **Center day list** — the primary working area; scrollable list of day sections
- **Right Someday panel** — always visible by default; collapsible and resizable
- **Bottom bar** — `alle logo | filter chips | task count | ▲ Today | docs ↗`

---

## Unified Data Model

```typescript
interface Task {
  id: string
  text: string
  notes: string | null              // markdown
  completed: boolean
  date: string | null               // null = Someday / unscheduled
  startTime: string | null          // "09:00" — null = all-day
  endTime: string | null            // "10:30" — null = all-day or open-ended
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

  reminder: { time: string; channels: ('push' | 'email')[] } | null

  createdAt: string
  updatedAt: string
}

interface SomeDayGroup {
  id: string
  name: string
  description: string | null
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

interface UserPreferences {
  id: string
  userId: string | null            // null in single-user mode
  theme: 'light' | 'dark' | 'system'
  accentScheme: string | null
  fontSize: 'small' | 'medium' | 'large'
  taskDensity: 'compact' | 'comfortable'
  completionAnimation: 'fade' | 'gray' | 'hide'
  deleteConfirmation: boolean
  rolloverEnabled: boolean
  rolloverTime: 'midnight' | '9am' | 'manual'
  showEmptyDays: boolean
  persistFilters: boolean
  someDayDefaultOpen: boolean
  locale: string                   // e.g. 'en', 'fr', 'es'
  someDayPanelWidth: number | null
  lastScrollDate: string | null
  activeFilters: string[]
  keyboardOverrides: Record<string, string>
  updatedAt: string
}
```

---

## Extensibility: Interface Inventory

Every major subsystem has an interface in `packages/shared`. Adapters implement the interface. New implementations can be swapped in without changing application code.

| Interface | Adapters |
|-----------|----------|
| `StorageAdapter` | In-memory, SQLite, PostgreSQL |
| `ExportAdapter` | JSON, CSV, Markdown, iCal |
| `ImportAdapter` | JSON, CSV, iCal, Todoist CSV, Things 3, Canvas |
| `EmailAdapter` | SMTP, Resend, Postmark |
| `PaymentAdapter` | Stripe, No-op (self-hosted) |
| `I18nAdapter` | locale JSON files |
| `NLPAdapter` | chrono-node (swappable) |
| `LoggerAdapter` | Console, file, structured (e.g. pino) |
| `RateLimiterAdapter` | In-memory, Redis |
| `NotificationAdapter` | Web Push, email |

---

## Command Palette Convention

The command palette (Cmd+K) has two modes:

- **Plain text** → fuzzy search across all tasks (title, tags, notes). Results scroll the day list to the matching task on selection.
- **`/` prefix** → command mode. Commands: `/add`, `/complete`, `/delete`, `/move`, `/go`, `/tag`, `/filter`, `/clear`, `/today`, `/someday`, `/settings`, `/help`, and more. The command registry is extensible.

---

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
One unified modal for search and commands. `/add buy milk tomorrow #work #p1` creates a task. Plain text searches. The fastest way to do anything in Alle.

### Project Management
Projects are collections of ordered tasks. When activated, tasks are auto-distributed across days between the project's start and due dates. Project tasks appear in the day list tagged with the project name.

### Habit Tracking
Recurring tasks generate daily instances automatically. Completing instances builds streaks. The Habits modal shows a GitHub-style heatmap of completion history per habit.

### Rollover
Incomplete tasks roll over to the next day by default. The `daysLate` counter tracks how overdue a task is. Configurable app-wide and per-task.

### Calendar Time-Grid View
Tasks with `startTime`/`endTime` can be viewed in a day or week time-grid view (like Google Calendar), available from the 📆 Calendar rail icon.

---

## Monorepo Structure

```
alle/
├── packages/
│   ├── client/   # SvelteKit frontend (Tailwind CSS)
│   ├── server/   # Bun REST API
│   ├── shared/   # Types, interfaces, constants, universal adapters
│   ├── cli/      # alle CLI — command + TUI modes (v2.0.0)
│   └── mcp/      # MCP server for AI automation (v2.1.0)
├── docs/
│   ├── adr/      # Architecture Decision Records (MADR format)
│   └── ...
├── tests/
└── package.json
```

---

## Persistence Strategy

| Phase | Adapter | When |
|-------|---------|------|
| Development | In-memory | v0.x |
| Self-hosted v1 | SQLite (bun:sqlite) | v0.8.0 |
| Multi-user v2 | PostgreSQL + Drizzle ORM | v2.3.0 |

---

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
- axe-core a11y checks passing in CI
- Zero known-vulnerable dependencies in CI
