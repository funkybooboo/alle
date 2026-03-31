# Design Patterns

This document defines the architectural design patterns used in the Alle project. These patterns are **REQUIRED** for maintaining clean, maintainable, and testable code architecture.

## Philosophy

Our architectural approach prioritizes:

- **Separation of concerns** — clear boundaries between layers
- **Dependency inversion** — depend on abstractions, not concrete implementations
- **Testability** — all components can be tested in isolation
- **Flexibility** — easy to swap implementations without changing business logic
- **Type safety** — leverage TypeScript's type system for compile-time guarantees

---

## 1. Dependency Injection Container Pattern

**PURPOSE**: Manage dependencies without tight coupling between components.

**WHEN TO USE**: Required for all application-level dependencies (repositories, services, adapters).

**IMPLEMENTATION**:

```typescript
// container.ts
export class Container {
  private _config: ConfigProvider | null = null;
  private _taskRepository: TaskRepository | null = null;
  private _httpClient: HttpClient | null = null;
  private _logger: Logger | null = null;
  private _dateProvider: DateProvider | null = null;

  get config(): ConfigProvider {
    if (!this._config) {
      this._config = new EnvConfigProvider();
    }
    return this._config;
  }

  get taskRepository(): TaskRepository {
    if (!this._taskRepository) {
      this._taskRepository = new InMemoryTaskRepository(this.dateProvider);
    }
    return this._taskRepository;
  }

  get httpClient(): HttpClient {
    if (!this._httpClient) {
      this._httpClient = new FetchHttpClient();
    }
    return this._httpClient;
  }

  get logger(): Logger {
    if (!this._logger) {
      this._logger = new ConsoleLogger();
    }
    return this._logger;
  }

  get dateProvider(): DateProvider {
    if (!this._dateProvider) {
      this._dateProvider = new NativeDateProvider();
    }
    return this._dateProvider;
  }
}

export const container: Container = new Container();
```

**BENEFITS**:
- Single source of truth for dependency wiring
- Easy to swap implementations for testing or production
- Lazy initialization for better performance
- Type-safe dependency resolution

**USAGE**:
```typescript
// In application code
import { container } from './container';

const tasks = await container.taskRepository.getAll();
```

---

## 2. Repository Pattern with Specification

**PURPOSE**: Abstract data access logic and provide flexible querying capabilities.

**WHEN TO USE**: REQUIRED for all data persistence operations.

**BASIC REPOSITORY**:

```typescript
// TaskRepository interface (in shared package)
export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  save(task: CreateTaskInput): Promise<Task>;
  update(id: string, task: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;
}

// Implementation (in server package)
export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();

  constructor(private dateProvider: DateProvider) {}

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async save(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      text: input.text,
      completed: false,
      date: input.date,
      createdAt: this.dateProvider.now(),
      updatedAt: this.dateProvider.now(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const existing = this.tasks.get(id);
    if (!existing) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }
    const updated: Task = {
      ...existing,
      ...input,
      updatedAt: this.dateProvider.now(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const exists = this.tasks.has(id);
    if (!exists) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }
    this.tasks.delete(id);
  }
}
```

**BENEFITS**:
- Business logic doesn't know about database implementation
- Easy to swap database technologies
- Simple to create test implementations
- Centralized data access logic

---

## 3. Adapter Pattern

**PURPOSE**: Provide consistent interfaces for third-party services and infrastructure.

**WHEN TO USE**: REQUIRED for all external dependencies (HTTP, config, logging, databases, etc.).

**IMPLEMENTATION** (Already used throughout Alle):

```typescript
// Port (interface in shared package)
export interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
  put<T>(url: string, data: unknown): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

// Adapter (implementation in shared package)
export class FetchHttpClient implements HttpClient {
  async get<T>(url: string): Promise<T> {
    const response: Response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response: Response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  // ... other methods
}
```

**BENEFITS**:
- Swap implementations without changing business logic
- Easy to create test adapters
- Isolates external dependencies
- Framework-agnostic core logic

**REAL EXAMPLES IN ALLE**:
- `ConfigProvider` — Environment variable access
- `HttpClient` — HTTP requests
- `Logger` — Structured logging
- `DateProvider` — Date/time operations
- `TaskRepository` — Data persistence

---

## 4. Strategy Pattern with Function Composition

**PURPOSE**: Select algorithms or behavior at runtime without inheritance hierarchies.

**WHEN TO USE**: When you have multiple algorithms for the same task that should be interchangeable.

**IMPLEMENTATION**:

```typescript
// Pure function strategies
type PricingStrategy = (price: number) => number;

const regularPricing: PricingStrategy = (price: number): number => price;

const studentDiscount: PricingStrategy = (price: number): number => price * 0.9;

const bulkDiscount: PricingStrategy = (price: number): number => price * 0.85;

// Strategy selector
function selectPricingStrategy(userType: string): PricingStrategy {
  switch (userType) {
    case 'student':
      return studentDiscount;
    case 'bulk':
      return bulkDiscount;
    default:
      return regularPricing;
  }
}

// Usage
const strategy: PricingStrategy = selectPricingStrategy(user.type);
const finalPrice: number = strategy(basePrice);
```

**BENEFITS**:
- No class hierarchies needed
- Pure functions are easy to test
- Composable and chainable
- Type-safe strategy selection

---

## 5. Observer Pattern (Type-Safe Events)

**PURPOSE**: Implement event-driven communication between components without tight coupling.

**WHEN TO USE**: When components need to react to events from other components.

**IMPLEMENTATION**:

```typescript
type EventHandler<T> = (payload: T) => void | Promise<void>;

class EventBus {
  private handlers: Map<string, Set<EventHandler<unknown>>> = new Map();

  on<T>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown>);
  }

  off<T>(event: string, handler: EventHandler<T>): void {
    this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
  }

  async emit<T>(event: string, payload: T): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    const promises = Array.from(handlers).map(handler => handler(payload));
    await Promise.all(promises);
  }
}

// Usage
const eventBus = new EventBus();

interface TaskCreatedEvent {
  taskId: string;
  text: string;
  createdAt: string;
}

eventBus.on<TaskCreatedEvent>('task.created', async (event) => {
  await logger.info('Task created', { taskId: event.taskId });
  await sendNotification(event);
});

await eventBus.emit<TaskCreatedEvent>('task.created', {
  taskId: task.id,
  text: task.text,
  createdAt: task.createdAt,
});
```

**BENEFITS**:
- Decoupled components
- Type-safe event payloads
- Easy to add new event handlers
- Supports async handlers

---

## 6. Command Pattern with Undo/Redo

**PURPOSE**: Encapsulate operations as objects to support undo/redo, logging, and queuing.

**WHEN TO USE**: For user actions that should be undoable or need to be logged/queued.

**IMPLEMENTATION**:

```typescript
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
}

class CreateTaskCommand implements Command {
  private createdTaskId: string | null = null;

  constructor(
    private repository: TaskRepository,
    private taskData: CreateTaskInput
  ) {}

  async execute(): Promise<void> {
    const task = await this.repository.save(this.taskData);
    this.createdTaskId = task.id;
  }

  async undo(): Promise<void> {
    if (this.createdTaskId) {
      await this.repository.delete(this.createdTaskId);
    }
  }
}

class CommandHistory {
  private history: Command[] = [];
  private currentIndex: number = -1;

  async execute(command: Command): Promise<void> {
    await command.execute();

    // Remove any commands after current position
    this.history = this.history.slice(0, this.currentIndex + 1);

    this.history.push(command);
    this.currentIndex++;
  }

  async undo(): Promise<void> {
    if (this.currentIndex < 0) return;

    const command = this.history[this.currentIndex];
    await command.undo();
    this.currentIndex--;
  }

  async redo(): Promise<void> {
    if (this.currentIndex >= this.history.length - 1) return;

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    await command.execute();
  }
}

// Usage
const commandHistory = new CommandHistory();

const createCommand = new CreateTaskCommand(repository, {
  text: 'New task',
  date: '2024-01-15',
});

await commandHistory.execute(createCommand);  // Creates task
await commandHistory.undo();                   // Deletes task
await commandHistory.redo();                   // Creates task again
```

**BENEFITS**:
- Easy to implement undo/redo
- Commands can be logged for audit trails
- Commands can be queued for batch processing
- Separates invocation from execution

---

## 7. Decorator Pattern

**PURPOSE**: Add cross-cutting concerns (logging, caching, metrics) without modifying original code.

**WHEN TO USE**: For adding reusable behavior like logging, caching, retry logic, or metrics.

**IMPLEMENTATION**:

```typescript
// Base repository
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// Logging decorator
class LoggingUserRepository implements UserRepository {
  constructor(
    private wrapped: UserRepository,
    private logger: Logger
  ) {}

  async findById(id: string): Promise<User | null> {
    await this.logger.info('Finding user', { id });
    const result = await this.wrapped.findById(id);
    await this.logger.info('User found', { id, found: result !== null });
    return result;
  }

  async save(user: User): Promise<User> {
    await this.logger.info('Saving user', { userId: user.id });
    const result = await this.wrapped.save(user);
    await this.logger.info('User saved', { userId: result.id });
    return result;
  }
}

// Caching decorator
class CachingUserRepository implements UserRepository {
  private cache: Map<string, User> = new Map();

  constructor(private wrapped: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    const user = await this.wrapped.findById(id);
    if (user) {
      this.cache.set(id, user);
    }
    return user;
  }

  async save(user: User): Promise<User> {
    const result = await this.wrapped.save(user);
    this.cache.set(result.id, result);
    return result;
  }
}

// Usage - stack decorators
const baseRepo = new DatabaseUserRepository();
const cachedRepo = new CachingUserRepository(baseRepo);
const loggedRepo = new LoggingUserRepository(cachedRepo, logger);

// Now loggedRepo has both caching and logging
const user = await loggedRepo.findById('123');
```

**BENEFITS**:
- Add behavior without modifying original class
- Combine multiple decorators
- Preserve interface compatibility
- Easy to test decorators independently

---

## 8. Result Pattern (Monadic Error Handling)

**PURPOSE**: Explicit error handling without exceptions, inspired by Rust's Result<T, E>.

**WHEN TO USE**: RECOMMENDED for all business logic that can fail.

**IMPLEMENTATION**:

```typescript
type Result<T, E> = Success<T> | Failure<E>;

class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(public readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }

  flatMap<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value);
  }
}

class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(public readonly error: E) {}

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return new Failure(this.error);
  }

  flatMap<U, F>(_fn: (value: never) => Result<U, F>): Result<U, E> {
    return new Failure(this.error);
  }
}

// Usage
function parseUser(data: unknown): Result<User, ValidationError> {
  if (!isValidUserData(data)) {
    return new Failure(new ValidationError('Invalid user data'));
  }
  return new Success(data as User);
}

function saveUser(user: User): Result<User, DatabaseError> {
  try {
    const saved = repository.save(user);
    return new Success(saved);
  } catch (error) {
    return new Failure(new DatabaseError('Failed to save user'));
  }
}

// Chain operations
const result = parseUser(data)
  .flatMap(user => saveUser(user))
  .map(user => ({ id: user.id, name: user.name }));

if (result.isSuccess) {
  console.log('Saved user:', result.value);
} else {
  console.error('Failed:', result.error);
}
```

**BENEFITS**:
- Explicit error handling at compile time
- No hidden exceptions
- Composable error handling
- Type-safe error propagation

---

## Pattern Selection Guide

Use this guide to select the appropriate pattern:

| Problem | Pattern | Example in Alle |
|---------|---------|----------------|
| Need to swap implementations | Adapter | ConfigProvider, HttpClient, Logger |
| Need to manage dependencies | Dependency Injection | Container class |
| Need to abstract data access | Repository | TaskRepository |
| Need runtime algorithm selection | Strategy | Pricing, validation strategies |
| Need component communication | Observer | Event bus for domain events |
| Need to add cross-cutting concerns | Decorator | Logging, caching, metrics |
| Need undo/redo functionality | Command | User actions, operation history |
| Need explicit error handling | Result | Business logic validation |

---

## Best Practices

1. **Prefer Composition Over Inheritance**
   - Use interfaces and composition
   - Avoid deep class hierarchies

2. **Keep Patterns Simple**
   - Don't over-engineer
   - Use patterns only when they solve real problems

3. **Make Patterns Type-Safe**
   - Leverage TypeScript's type system
   - No `any` types in pattern implementations

4. **Document Pattern Usage**
   - Comment why a pattern was chosen
   - Reference this document in code

5. **Test Patterns Thoroughly**
   - Each pattern implementation needs tests
   - Test both the pattern and its usage

---

## Anti-Patterns to Avoid

❌ **NEVER**:
- Use patterns for the sake of using patterns
- Create unnecessary abstraction layers
- Implement patterns with `any` types
- Copy pattern code without understanding it
- Mix multiple patterns in confusing ways

✅ **ALWAYS**:
- Choose the simplest solution that works
- Document why you chose a pattern
- Keep pattern implementations clean and focused
- Test pattern implementations thoroughly
- Review pattern usage in code reviews
