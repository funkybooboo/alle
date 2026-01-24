# Diagramming Standards

This document defines the standards for creating diagrams using Mermaid in Markdown. Visual diagrams are **REQUIRED** for documenting architecture, flows, and complex systems.

## Philosophy

Our diagramming approach prioritizes:

- **Plain text diagrams** — version controlled with code
- **Mermaid syntax** — renders in GitHub, editors, and documentation sites
- **Clarity over completeness** — show what matters, hide the rest
- **Living diagrams** — updated with code changes
- **Consistent style** — recognizable patterns across all diagrams

---

## Why Mermaid?

**RULE**: ALL diagrams MUST be created using Mermaid syntax in Markdown files.

### Benefits

- **Version Controlled**: Diagrams stored as text in Git
- **Reviewable**: Diagram changes visible in pull requests
- **Universal**: Renders on GitHub, GitLab, VS Code, IDEs
- **Maintainable**: Update text, rendering updates automatically
- **Searchable**: Find diagrams by searching text
- **No Special Tools**: Edit with any text editor

❌ **NEVER**:
- Use draw.io, Lucidchart, or other external tools
- Store diagrams as images (.png, .jpg, .svg exports)
- Keep diagrams in separate documents from code

✅ **ALWAYS**:
- Write diagrams in Mermaid syntax
- Store in `.md` files in `docs/diagrams/`
- Update diagrams with code changes
- Review diagrams in pull requests

---

## Diagram Types & When to Use

| Diagram Type | Purpose | When to Create |
|--------------|---------|----------------|
| System Context | Show system boundaries and external actors | New project, major architecture changes |
| Container | Show high-level tech containers and interactions | Microservices, multi-tier apps |
| Component | Show internal structure of a container | Complex services, new major features |
| Sequence | Show request/response flow through system | API endpoints, complex interactions |
| State Machine | Show entity states and transitions | Workflow modeling, business processes |
| ERD | Show database schema and relationships | Database changes, data modeling |
| Flowchart | Show decision logic and control flow | Algorithms, business rules |
| User Journey | Show user interactions and experience | New features, UX improvements |

---

## 1. System Context Diagrams (C4 Model Level 1)

**PURPOSE**: Show the big picture — your system and its external dependencies.

**WHEN**: Create at project start and update when adding external integrations.

```mermaid
graph TB
    User[User<br/>End User]
    Admin[Admin<br/>System Administrator]

    System[Alle Task Manager<br/>Web Application]

    DB[(PostgreSQL<br/>Database)]
    Email[SendGrid<br/>Email Service]
    Auth[Google OAuth<br/>Authentication]

    User -->|Manages tasks| System
    Admin -->|Configures| System

    System -->|Reads/writes| DB
    System -->|Sends emails| Email
    System -->|Authenticates| Auth

    style System fill:#1168bd,stroke:#0b4884,color:#ffffff
    style User fill:#08427b,stroke:#052e56,color:#ffffff
    style Admin fill:#08427b,stroke:#052e56,color:#ffffff
```

**Template**:
````markdown
```mermaid
graph TB
    Actor1[Actor Name<br/>Role]
    Actor2[Actor Name<br/>Role]

    System[System Name<br/>Type]

    External1[Service Name<br/>Technology]
    External2[Service Name<br/>Technology]

    Actor1 -->|Action| System
    System -->|Action| External1

    style System fill:#1168bd,stroke:#0b4884,color:#ffffff
```
````

---

## 2. Container Diagrams (C4 Model Level 2)

**PURPOSE**: Show major containers (apps, services, databases) and how they interact.

**WHEN**: Multi-container architecture, microservices.

```mermaid
graph TB
    User[User]

    subgraph "Alle System"
        Client[Client Application<br/>React + Vite<br/>Port 3000]
        API[API Server<br/>Bun HTTP Server<br/>Port 4000]
        DB[(Database<br/>PostgreSQL)]
        Cache[(Cache<br/>Redis)]
    end

    Email[Email Service<br/>SendGrid]

    User -->|HTTPS| Client
    Client -->|REST API| API
    API -->|Reads/writes| DB
    API -->|Caches| Cache
    API -->|Sends| Email

    style Client fill:#438dd5,stroke:#2e6295,color:#ffffff
    style API fill:#438dd5,stroke:#2e6295,color:#ffffff
    style DB fill:#3b48cc,stroke:#2a3599,color:#ffffff
    style Cache fill:#3b48cc,stroke:#2a3599,color:#ffffff
```

---

## 3. Component Diagrams (C4 Model Level 3)

**PURPOSE**: Show internal structure of a container (layers, components).

**WHEN**: Complex services, explaining internal architecture.

```mermaid
graph TB
    subgraph "API Server Container"
        Routes[HTTP Routes<br/>Express/Bun Router]

        subgraph "Business Logic Layer"
            TaskService[Task Service]
            UserService[User Service]
            AuthService[Auth Service]
        end

        subgraph "Data Access Layer"
            TaskRepo[Task Repository]
            UserRepo[User Repository]
        end

        Container[Dependency Injection<br/>Container]
    end

    DB[(PostgreSQL)]

    Routes --> TaskService
    Routes --> UserService
    Routes --> AuthService

    TaskService --> TaskRepo
    UserService --> UserRepo
    AuthService --> UserRepo

    TaskRepo --> DB
    UserRepo --> DB

    Container -.provides.-> TaskService
    Container -.provides.-> UserService
    Container -.provides.-> TaskRepo
```

---

## 4. Sequence Diagrams (API Request Flow)

**PURPOSE**: Show step-by-step interaction between components over time.

**WHEN**: Documenting API endpoints, complex multi-step processes.

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant TaskRepo
    participant DB

    Client->>+API: POST /api/tasks
    Note over Client,API: {text: "Buy groceries", date: "2024-01-15"}

    API->>+Auth: verifyToken(req.headers.authorization)
    Auth-->>-API: userId: "123"

    API->>API: validateTaskInput(body)

    API->>+TaskRepo: save({text, date, userId})
    TaskRepo->>+DB: INSERT INTO tasks...
    DB-->>-TaskRepo: task_id: "abc"
    TaskRepo-->>-API: Task{id: "abc", ...}

    API-->>-Client: 201 Created
    Note over API,Client: {id: "abc", text: "Buy groceries", ...}
```

**Template**:
````markdown
```mermaid
sequenceDiagram
    participant A as Component A
    participant B as Component B

    A->>+B: request()
    Note over A,B: Description of what happens
    B-->>-A: response()
```
````

---

## 5. State Machine Diagrams

**PURPOSE**: Show entity states and valid transitions.

**WHEN**: Modeling workflows, order processing, user onboarding.

```mermaid
stateDiagram-v2
    [*] --> Draft: Create task

    Draft --> Active: Publish
    Draft --> Deleted: Delete

    Active --> Completed: Mark complete
    Active --> Paused: Pause
    Active --> Deleted: Delete

    Paused --> Active: Resume
    Paused --> Deleted: Delete

    Completed --> Active: Reopen
    Completed --> Archived: Archive after 30 days

    Archived --> [*]
    Deleted --> [*]

    note right of Draft
        Editable, not visible
        to other users
    end note

    note right of Completed
        Read-only, shown
        with strikethrough
    end note
```

**Template**:
````markdown
```mermaid
stateDiagram-v2
    [*] --> StateA: event
    StateA --> StateB: event
    StateB --> [*]

    note right of StateA
        Description
    end note
```
````

---

## 6. Entity Relationship Diagrams (ERD)

**PURPOSE**: Show database schema, tables, and relationships.

**WHEN**: Database design, schema changes, data modeling.

```mermaid
erDiagram
    USER ||--o{ TASK : creates
    USER ||--o{ SESSION : has
    TASK }o--|| CATEGORY : belongs_to

    USER {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
        timestamp updated_at
    }

    TASK {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        string text
        boolean completed
        date date
        timestamp created_at
        timestamp updated_at
    }

    CATEGORY {
        uuid id PK
        string name UK
        string color
    }

    SESSION {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
    }
```

**Relationship Notation**:
- `||--o{` — One to zero or more
- `||--|{` — One to one or more
- `}o--||` — Zero or more to one
- `}|--|{` — One or more to one or more

---

## 7. Flowchart (Decision Logic)

**PURPOSE**: Show algorithm logic, decision trees, control flow.

**WHEN**: Complex business rules, validation logic, algorithms.

```mermaid
flowchart TD
    Start([User submits task])

    ValidateInput{Input valid?}
    Start --> ValidateInput

    ValidateInput -->|No| ReturnError[Return 400 Bad Request]
    ReturnError --> End([End])

    ValidateInput -->|Yes| CheckAuth{User authenticated?}

    CheckAuth -->|No| Return401[Return 401 Unauthorized]
    Return401 --> End

    CheckAuth -->|Yes| CheckDuplicate{Task already exists?}

    CheckDuplicate -->|Yes| Return409[Return 409 Conflict]
    Return409 --> End

    CheckDuplicate -->|No| SaveTask[Save task to database]
    SaveTask --> SendEmail{Email notifications enabled?}

    SendEmail -->|Yes| QueueEmail[Queue email notification]
    QueueEmail --> Return201

    SendEmail -->|No| Return201[Return 201 Created]
    Return201 --> End

    style Start fill:#90EE90
    style End fill:#FFB6C1
    style ReturnError fill:#FF6B6B
    style Return401 fill:#FF6B6B
    style Return409 fill:#FFA500
    style Return201 fill:#90EE90
```

---

## 8. User Journey Diagrams

**PURPOSE**: Show user interaction flow through the application.

**WHEN**: New features, UX design, onboarding flows.

```mermaid
journey
    title User creates first task
    section Sign Up
      Visit homepage: 5: User
      Click "Sign Up": 5: User
      Fill registration form: 3: User
      Verify email: 2: User
      Account created: 5: User
    section First Task
      View empty task list: 3: User
      Click "Add Task": 5: User
      Type task description: 5: User
      Select due date: 4: User
      Click "Save": 5: User
      See task in list: 5: User
    section Discovery
      Explore filters: 4: User
      Sort by date: 5: User
      Mark task complete: 5: User
      Feel accomplished: 5: User
```

**Scoring**:
- 1 = Very unhappy/frustrated
- 3 = Neutral
- 5 = Very happy/delighted

---

## 9. Git Branching Diagram

**PURPOSE**: Show branching strategy and workflow.

**WHEN**: Documenting Git workflow, onboarding new developers.

```mermaid
gitGraph
    commit id: "Initial commit"
    commit id: "Setup project"

    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add login UI"
    commit id: "Add OAuth"

    checkout main
    commit id: "Hotfix: security patch"

    checkout feature/user-auth
    commit id: "Add tests"

    checkout main
    merge feature/user-auth tag: "v1.1.0"

    branch feature/task-filter
    checkout feature/task-filter
    commit id: "Add date filter"
    commit id: "Add tests"

    checkout main
    merge feature/task-filter tag: "v1.2.0"

    commit id: "Production deploy"
```

---

## Diagram Style Guidelines

### Naming Conventions

✅ **GOOD**:
```
User
TaskService
PostgreSQL Database
HTTP API Server
```

❌ **BAD**:
```
user (not capitalized)
task_service (snake_case)
db (not descriptive)
server (ambiguous)
```

### Node Labels

Include both name and technology:
```
API Server
Bun HTTP
Port 4000
```

### Arrows and Relationships

Use descriptive verbs on arrows:
```
User -->|Creates| Task
API -->|Queries| Database
Client -->|Sends HTTP POST| Server
```

### Colors and Styling

Use consistent colors:
- **System Boundary**: Blue (#1168bd)
- **User/Actor**: Dark Blue (#08427b)
- **Database**: Purple (#3b48cc)
- **External Service**: Gray (#999999)
- **Success State**: Green (#90EE90)
- **Error State**: Red (#FF6B6B)
- **Warning State**: Orange (#FFA500)

---

## Documentation Location

**RULE**: Store diagrams in `docs/diagrams/` organized by type.

```
docs/diagrams/
├── architecture/
│   ├── system-context.md
│   ├── container-diagram.md
│   └── component-diagrams.md
├── flows/
│   ├── api-request-flows.md
│   ├── authentication-flow.md
│   └── task-creation-flow.md
├── database/
│   └── schema-erd.md
└── workflows/
    ├── git-workflow.md
    └── user-journeys.md
```

---

## When to Create Diagrams

**REQUIRED**:
- New project setup (system context)
- Major architecture changes (container, component)
- New API endpoints (sequence)
- Database schema changes (ERD)
- Complex business logic (flowchart)
- Workflow changes (state machine)

**OPTIONAL** (but recommended):
- User onboarding flows (user journey)
- Complex algorithms (flowchart)
- Multi-service interactions (sequence)

---

## Diagram Review Checklist

Before merging diagrams:

- [ ] Uses Mermaid syntax (not external tool)
- [ ] Renders correctly on GitHub
- [ ] Labels are clear and descriptive
- [ ] Arrows have descriptive text
- [ ] Consistent naming conventions
- [ ] Consistent color scheme
- [ ] Appropriate level of detail (not too much, not too little)
- [ ] Updated to reflect current code
- [ ] Stored in correct location
- [ ] Referenced from related documentation

---

## Tools for Editing

Recommended editors for Mermaid diagrams:

1. **VS Code** — with Mermaid extension (live preview)
2. **Mermaid Live Editor** — https://mermaid.live (online)
3. **GitHub** — renders automatically in Markdown files
4. **IntelliJ/WebStorm** — built-in Mermaid support

---

## Summary

Diagrams are living documentation that evolves with the code. Keep them simple, clear, and up-to-date to maximize their value.
