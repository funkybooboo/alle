# I/O Abstraction

This document explains how to design business logic that is completely independent of input/output mechanisms, enabling the same code to power CLI tools, TUIs, web APIs, desktop apps, and more.

## Philosophy

Our I/O abstraction approach prioritizes:

- **Business logic independence** — core logic knows nothing about presentation or storage
- **Hexagonal architecture** — business logic at center, I/O at edges
- **Framework agnosticism** — never tied to a specific web framework or UI library
- **Multiple interfaces** — same logic, many presentations (web, CLI, TUI, desktop)
- **Testability** — pure business logic is trivially testable

---

## Hexagonal Architecture (Ports & Adapters)

**PRINCIPLE**: Business logic should not depend on external systems.

### The Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Adapters (I/O)                       │
│                                                         │
│  Web API    CLI    TUI    GraphQL    Desktop App       │
│     │        │      │        │            │            │
│     └────────┴──────┴────────┴────────────┘            │
│                      │                                  │
│              ┌───────▼────────┐                        │
│              │  Input Ports   │                        │
│              │ (Interfaces)   │                        │
│              └───────┬────────┘                        │
│                      │                                  │
│         ┌────────────▼───────────────┐                 │
│         │    Business Logic Core     │                 │
│         │                             │                 │
│         │  - Domain Models            │                 │
│         │  - Use Cases                │                 │
│         │  - Business Rules           │                 │
│         └────────────┬────────────────┘                 │
│                      │                                  │
│              ┌───────▼────────┐                        │
│              │  Output Ports  │                        │
│              │ (Interfaces)   │                        │
│              └───────┬────────┘                        │
│                      │                                  │
│     ┌────────────────┴────────────────┐                │
│     │                                  │                │
│  Database    Email    File Storage   Cache             │
│                                                         │
│                    Adapters (I/O)                       │
└─────────────────────────────────────────────────────────┘
```

### Layers

1. **Business Logic Core** (center):
   - Domain models
   - Use cases
   - Business rules
   - No I/O dependencies

2. **Ports** (interfaces):
   - Input ports: Commands and queries
   - Output ports: Repositories and services
   - Define contracts, no implementations

3. **Adapters** (edges):
   - Input adapters: Web API, CLI, TUI
   - Output adapters: Database, email, storage

---

## Pure Business Logic Layer

**RULE**: Business logic MUST NOT import I/O libraries.

### Domain Models

Domain models are pure data structures with business rules:

```typescript
// ✅ GOOD - Pure domain model
export class Task {
  private constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly completed: boolean,
    public readonly date: string,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {
    this.validateText(text);
    this.validateDate(date);
  }

  static create(text: string, date: string): Task {
    return new Task(
      crypto.randomUUID(),
      text,
      false,
      date,
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  complete(): Task {
    return new Task(
      this.id,
      this.text,
      true,
      this.date,
      this.createdAt,
      new Date().toISOString()
    );
  }

  private validateText(text: string): void {
    if (text.length < 1 || text.length > 500) {
      throw new ValidationError('Task text must be 1-500 characters');
    }
  }

  private validateDate(date: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ValidationError('Date must be ISO 8601 format');
    }
  }
}

// ❌ BAD - Depends on database
import { Database } from 'postgres';  // I/O dependency!

export class Task {
  async save(db: Database) {  // Business logic coupled to database
    await db.query('INSERT INTO tasks...');
  }
}
```

### Use Cases

Use cases orchestrate business logic without knowing about I/O:

```typescript
// ✅ GOOD - Pure use case with injected ports
export class CreateTaskUseCase {
  constructor(
    private taskRepository: TaskRepository,  // Output port (interface)
    private dateProvider: DateProvider       // Output port (interface)
  ) {}

  async execute(input: CreateTaskInput): Promise<Result<Task, ValidationError>> {
    // Validate input
    if (!this.isValidInput(input)) {
      return new Failure(new ValidationError('Invalid input'));
    }

    // Business logic
    const task: Task = {
      id: crypto.randomUUID(),
      text: input.text,
      completed: false,
      date: input.date,
      createdAt: this.dateProvider.now(),
      updatedAt: this.dateProvider.now(),
    };

    // Delegate to repository (through port)
    const saved = await this.taskRepository.save(task);

    return new Success(saved);
  }

  private isValidInput(input: CreateTaskInput): boolean {
    return input.text.length > 0 && input.text.length <= 500;
  }
}
```

---

## Port Interfaces (Contracts)

**RULE**: Ports define WHAT needs to happen, not HOW.

### Input Ports (Commands & Queries)

```typescript
// Input port for creating tasks
export interface CreateTaskCommand {
  execute(input: CreateTaskInput): Promise<Result<Task, AppError>>;
}

// Input port for querying tasks
export interface GetTasksQuery {
  execute(filter?: TaskFilter): Promise<Result<Task[], AppError>>;
}
```

### Output Ports (Repositories & Services)

```typescript
// Output port for task persistence
export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(filter?: TaskFilter): Promise<Task[]>;
  save(task: CreateTaskInput): Promise<Task>;
  update(id: string, task: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;
}

// Output port for email notifications
export interface EmailService {
  sendTaskReminder(task: Task, user: User): Promise<void>;
  sendWelcomeEmail(user: User): Promise<void>;
}

// Output port for date/time operations
export interface DateProvider {
  now(): string;
  addDays(date: string, days: number): string;
  isBefore(date1: string, date2: string): boolean;
}
```

**KEY PRINCIPLE**: Ports are interfaces, NEVER concrete implementations.

---

## Adapter Implementations (Swappable)

**RULE**: Adapters implement ports and can be swapped without changing business logic.

### Database Adapters

```typescript
// PostgreSQL implementation
export class PostgresTaskRepository implements TaskRepository {
  constructor(private sql: Postgres) {}

  async findById(id: string): Promise<Task | null> {
    const [task] = await this.sql`
      SELECT * FROM tasks WHERE id = ${id}
    `;
    return task ?? null;
  }

  async save(input: CreateTaskInput): Promise<Task> {
    const [task] = await this.sql`
      INSERT INTO tasks (id, text, date, completed, created_at, updated_at)
      VALUES (${crypto.randomUUID()}, ${input.text}, ${input.date}, false, NOW(), NOW())
      RETURNING *
    `;
    return task;
  }

  // Other methods...
}

// In-memory implementation (testing/development)
export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async save(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      text: input.text,
      date: input.date,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  // Other methods...
}

// MongoDB implementation
export class MongoTaskRepository implements TaskRepository {
  constructor(private db: MongoClient) {}

  async findById(id: string): Promise<Task | null> {
    return this.db.collection('tasks').findOne({ _id: id });
  }

  // Other methods...
}
```

**Switch implementations**:
```typescript
// Development
const repository: TaskRepository = new InMemoryTaskRepository();

// Production
const repository: TaskRepository = new PostgresTaskRepository(sql);

// Use case doesn't change!
const useCase = new CreateTaskUseCase(repository, dateProvider);
```

---

## Presentation Layer Adapters

**RULE**: Same business logic, multiple presentation adapters.

### Web API Adapter (Bun HTTP)

```typescript
// Web API adapter translates HTTP → Use Case
const server = Bun.serve({
  port: 4000,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === '/api/tasks' && req.method === 'POST') {
      // 1. Parse HTTP request
      const body = await req.json();

      // 2. Execute use case
      const useCase = container.createTaskUseCase;
      const result = await useCase.execute({
        text: body.text,
        date: body.date,
      });

      // 3. Translate result → HTTP response
      if (result.isFailure) {
        return new Response(JSON.stringify({ error: result.error.message }), {
          status: 400,
        });
      }

      return new Response(JSON.stringify({ data: result.value }), {
        status: 201,
      });
    }

    return new Response('Not Found', { status: 404 });
  }
});
```

### CLI Adapter (Command Line)

```typescript
// CLI adapter translates args → Use Case
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    text: { type: 'string' },
    date: { type: 'string' },
  }
});

// Execute same use case
const useCase = container.createTaskUseCase;
const result = await useCase.execute({
  text: values.text!,
  date: values.date!,
});

// Translate result → console output
if (result.isFailure) {
  console.error(`Error: ${result.error.message}`);
  process.exit(1);
}

console.log(`Task created: ${result.value.id}`);
```

### TUI Adapter (Terminal UI)

```typescript
// TUI adapter using blessed or ink
import blessed from 'blessed';

const screen = blessed.screen({ smartCSR: true });

const form = blessed.form({
  parent: screen,
  keys: true,
  left: 'center',
  top: 'center',
  width: 50,
  height: 10,
  content: 'Create Task'
});

const textInput = blessed.textbox({
  parent: form,
  name: 'text',
  top: 1,
  left: 1,
  height: 3,
  width: 45,
  inputOnFocus: true,
  content: 'Task text:'
});

form.on('submit', async (data) => {
  // Execute same use case
  const useCase = container.createTaskUseCase;
  const result = await useCase.execute({
    text: data.text,
    date: new Date().toISOString().split('T')[0],
  });

  // Translate result → TUI update
  if (result.isFailure) {
    // Show error in TUI
    blessed.message({ content: `Error: ${result.error.message}` });
  } else {
    // Show success in TUI
    blessed.message({ content: `Task created: ${result.value.text}` });
  }
});

screen.render();
```

### GraphQL Adapter

```typescript
// GraphQL adapter translates queries/mutations → Use Case
import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Task {
    id: ID!
    text: String!
    date: String!
    completed: Boolean!
  }

  type Mutation {
    createTask(text: String!, date: String!): Task!
  }
`);

const resolvers = {
  createTask: async ({ text, date }: { text: string; date: string }) => {
    // Execute same use case
    const useCase = container.createTaskUseCase;
    const result = await useCase.execute({ text, date });

    // Translate result → GraphQL response
    if (result.isFailure) {
      throw new Error(result.error.message);
    }

    return result.value;
  }
};
```

---

## Testing Benefits

**BENEFIT**: Pure business logic is trivially testable.

```typescript
// Test without any I/O!
test('CreateTaskUseCase validates text length', async () => {
  // Arrange - use test doubles (not mocks)
  const repository = new InMemoryTaskRepository();
  const dateProvider = new TestDateProvider();
  const useCase = new CreateTaskUseCase(repository, dateProvider);

  // Act
  const result = await useCase.execute({
    text: '',  // Invalid (too short)
    date: '2024-01-15'
  });

  // Assert
  expect(result.isFailure).toBe(true);
  expect(result.error.message).toContain('Invalid input');
});
```

**NO** database, HTTP server, or UI needed for testing!

---

## Deployment Flexibility

Same codebase can be deployed as:

1. **Web API**: Bun HTTP server on port 4000
2. **CLI Tool**: `bun run task create "Buy groceries" --date 2024-01-15`
3. **TUI Application**: Interactive terminal interface
4. **Desktop App**: Electron or Tauri wrapper
5. **Mobile App**: React Native or Capacitor
6. **Serverless Functions**: AWS Lambda, Cloud Functions
7. **Background Workers**: Job queue processors

**ALL** using the same business logic.

---

## Summary: Key Rules

✅ **DO**:
- Keep business logic pure (no I/O imports)
- Define ports as interfaces
- Create multiple adapters per port
- Inject dependencies through constructors
- Test business logic without I/O

❌ **NEVER**:
- Import database libraries in business logic
- Import HTTP libraries in business logic
- Import UI libraries in business logic
- Hardcode I/O mechanisms
- Skip the adapter layer

---

## Alle's Current Implementation

Alle already uses I/O abstraction extensively:

| Port | Interface | Adapters |
|------|-----------|----------|
| Config | `ConfigProvider` | `EnvConfigProvider`, `ViteConfigProvider` |
| HTTP | `HttpClient` | `FetchHttpClient` |
| Logging | `Logger` | `ConsoleLogger` |
| Date/Time | `DateProvider` | `NativeDateProvider` |
| HTTP Server | `HttpServer` | `BunHttpServer` |
| Task Storage | `TaskRepository` | `InMemoryTaskRepository` |

**Future**: Add PostgreSQL, CLI, and TUI adapters without changing business logic.

---

## Further Reading

- Hexagonal Architecture: https://alistair.cockburn.us/hexagonal-architecture/
- Clean Architecture (Uncle Bob): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Ports and Adapters Pattern: https://herbertograca.com/2017/09/14/ports-adapters-architecture/
