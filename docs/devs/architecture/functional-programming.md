# Functional Programming

This document explains how to combine functional programming (FP) and object-oriented programming (OOP) to get the best of both worlds, with inspiration from Rust's safety and expressiveness.

## Philosophy

Our FP + OOP hybrid approach prioritizes:

- **OOP for organization** — classes and interfaces for structure
- **FP for computation** — pure functions for logic
- **Immutability** — prefer immutable data structures
- **Type safety** — leverage TypeScript's type system
- **Explicit errors** — no hidden exceptions
- **Composability** — build complex behavior from simple functions

---

## Core Principle: OOP for Organization, FP for Computation

**RULE**: Use OOP for structure and interfaces, FP for business logic and transformations.

### OOP Strengths (What We Use)

- **Encapsulation** — group related data and behavior
- **Interfaces** — define contracts (ports in hexagonal architecture)
- **Polymorphism** — swap implementations via interfaces
- **Dependency Injection** — manage dependencies cleanly

### FP Strengths (What We Use)

- **Pure Functions** — predictable, testable, composable
- **Immutability** — no unexpected mutations
- **Function Composition** — build complex from simple
- **Explicit State** — no hidden state or side effects

### The Hybrid

```typescript
// ✅ OOP for structure
export class TaskService {
  constructor(
    private repository: TaskRepository,  // OOP: dependency injection
    private logger: Logger
  ) {}

  // ✅ FP for computation
  async createTask(input: CreateTaskInput): Promise<Result<Task, ValidationError>> {
    // Pure function for validation
    const validationResult = validateTaskInput(input);
    if (validationResult.isFailure) {
      return validationResult;
    }

    // Pure function for transformation
    const task = buildTask(input, new Date().toISOString());

    // Side effect isolated to repository
    const saved = await this.repository.save(task);

    return new Success(saved);
  }
}

// Pure functions (FP)
function validateTaskInput(input: CreateTaskInput): Result<CreateTaskInput, ValidationError> {
  if (input.text.length < 1 || input.text.length > 500) {
    return new Failure(new ValidationError('Text must be 1-500 characters'));
  }
  return new Success(input);
}

function buildTask(input: CreateTaskInput, timestamp: string): Task {
  return {
    id: crypto.randomUUID(),
    text: input.text,
    date: input.date,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
```

---

## Immutability

**RULE**: Prefer immutable data structures. Never mutate objects.

### Immutable Domain Objects

```typescript
// ✅ GOOD - Immutable task
export class Task {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly completed: boolean,
    public readonly date: string,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  // Methods return NEW instances
  complete(): Task {
    return new Task(
      this.id,
      this.text,
      true,  // Changed
      this.date,
      this.createdAt,
      new Date().toISOString()  // New timestamp
    );
  }

  updateText(newText: string): Task {
    return new Task(
      this.id,
      newText,  // Changed
      this.completed,
      this.date,
      this.createdAt,
      new Date().toISOString()
    );
  }
}

// Usage
const task = new Task('1', 'Buy groceries', false, '2024-01-15', now, now);
const completed = task.complete();  // Returns NEW task

console.log(task.completed);      // false (original unchanged)
console.log(completed.completed); // true (new instance)
```

❌ **BAD** — Mutable object:
```typescript
export class Task {
  constructor(
    public id: string,
    public text: string,
    public completed: boolean  // Mutable!
  ) {}

  complete(): void {
    this.completed = true;  // Mutation! Dangerous!
  }
}

// Problems:
// - Hard to track changes
// - Race conditions in async code
// - Unexpected side effects
// - Breaks time-travel debugging
```

### Immutable Arrays and Objects

```typescript
// ✅ GOOD - Create new arrays/objects
const tasks: Task[] = [task1, task2, task3];

// Add task (new array)
const withNewTask = [...tasks, task4];

// Remove task (new array)
const withoutFirst = tasks.slice(1);

// Update task (new array)
const withUpdated = tasks.map(t =>
  t.id === taskId ? t.complete() : t
);

// Sort (new array)
const sorted = [...tasks].sort((a, b) => a.date.localeCompare(b.date));

// ❌ BAD - Mutate arrays
tasks.push(task4);         // Mutation!
tasks.splice(0, 1);        // Mutation!
tasks[0] = updatedTask;    // Mutation!
tasks.sort();              // Mutation!
```

---

## Monadic Error Handling (Result<T, E>)

**RULE**: Use Result<T, E> pattern for explicit error handling, inspired by Rust.

### Result Type

```typescript
export type Result<T, E> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(public readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }

  flatMap<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_default: T): T {
    return this.value;
  }
}

export class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(public readonly error: E) {}

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return new Failure(this.error);
  }

  flatMap<U, F>(_fn: (value: never) => Result<U, F>): Result<U, E> {
    return new Failure(this.error);
  }

  unwrap(): never {
    throw this.error;
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }
}
```

### Usage

```typescript
// Function returns Result instead of throwing
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
    return new Failure(new DatabaseError('Failed to save', { cause: error }));
  }
}

// Chain operations with flatMap
const result = parseUser(data)
  .flatMap(user => validateUser(user))
  .flatMap(user => saveUser(user))
  .map(user => ({ id: user.id, name: user.name }));

// Handle result
if (result.isSuccess) {
  console.log('Saved user:', result.value);
} else {
  console.error('Failed:', result.error.message);
}
```

### Benefits

- **Explicit errors** at compile time
- **No hidden exceptions** to forget catching
- **Composable** error handling
- **Type-safe** error propagation
- **Rust-like** safety in TypeScript

---

## Option<T> Type (Explicit Nullability)

**RULE**: Use Option<T> instead of null/undefined for optional values.

### Option Type

```typescript
export type Option<T> = Some<T> | None;

export class Some<T> {
  readonly isSome = true;
  readonly isNone = false;

  constructor(public readonly value: T) {}

  map<U>(fn: (value: T) => U): Option<U> {
    return new Some(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_default: T): T {
    return this.value;
  }
}

export class None {
  readonly isSome = false;
  readonly isNone = true;

  map<U>(_fn: (value: never) => U): Option<U> {
    return new None();
  }

  flatMap<U>(_fn: (value: never) => Option<U>): Option<U> {
    return new None();
  }

  unwrap(): never {
    throw new Error('Called unwrap on None');
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }
}
```

### Usage

```typescript
// Function returns Option instead of null
function findTaskById(id: string): Option<Task> {
  const task = tasks.get(id);
  return task ? new Some(task) : new None();
}

// Chain operations
const taskText = findTaskById('123')
  .map(task => task.text)
  .unwrapOr('Task not found');

// Or use with pattern matching
const task = findTaskById('123');
if (task.isSome) {
  console.log('Found task:', task.value.text);
} else {
  console.log('Task not found');
}
```

---

## Pure Functions and Function Composition

**RULE**: Prefer pure functions that can be composed.

### Pure Functions

```typescript
// ✅ Pure function
function calculateDiscount(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100);
}

// ✅ Pure function
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// ❌ Impure function (depends on external state)
let globalDiscount = 0.1;
function calculateDiscountImpure(price: number): number {
  return price * (1 - globalDiscount);  // Depends on global state
}

// ❌ Impure function (has side effects)
function calculateDiscountWithLog(price: number, discount: number): number {
  console.log('Calculating discount');  // Side effect!
  return price * (1 - discount / 100);
}
```

### Function Composition

```typescript
// Compose functions for reusability
function compose<A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
): (a: A) => C {
  return (a: A): C => f(g(a));
}

// Or use pipe for better readability
function pipe<A, B, C>(
  a: A,
  ...fns: [(a: A) => B, (b: B) => C]
): C {
  return fns.reduce((acc, fn) => fn(acc), a as never);
}

// Pure transformation pipeline
const finalPrice = pipe(
  100,                              // Start with price
  price => calculateDiscount(price, 10),  // Apply discount
  discounted => discounted * 1.08,        // Add tax
  total => formatCurrency(total)          // Format
);

console.log(finalPrice);  // "$97.20"
```

---

## Bringing Rust Concepts to TypeScript

### 1. Strict Type Safety

```typescript
// ✅ GOOD - Explicit types everywhere
function calculateTotal(items: Item[]): number {
  return items.reduce((sum: number, item: Item): number => sum + item.price, 0);
}

// ❌ BAD - Implicit any
function calculateTotal(items) {  // items: any
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 2. No Null/Undefined (Use Option<T>)

```typescript
// ✅ GOOD - Explicit optional
function findUser(id: string): Option<User> {
  const user = users.get(id);
  return user ? new Some(user) : new None();
}

// ❌ BAD - Implicit null
function findUser(id: string): User | null {  // Forgot to check? NPE!
  return users.get(id) ?? null;
}
```

### 3. Error Handling Without Exceptions

```typescript
// ✅ GOOD - Explicit Result
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return new Failure(new Error('Division by zero'));
  }
  return new Success(a / b);
}

// ❌ BAD - Hidden exception
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');  // Easy to forget to catch
  }
  return a / b;
}
```

### 4. Ownership and Borrowing (Conceptually)

While TypeScript doesn't have Rust's ownership system, we can follow the principles:

```typescript
// ✅ GOOD - Transfer ownership explicitly
class TaskOwnership {
  private task: Task | null;

  constructor(task: Task) {
    this.task = task;
  }

  // Transfer ownership (consume original)
  transfer(): Task {
    if (!this.task) {
      throw new Error('Task already transferred');
    }
    const task = this.task;
    this.task = null;  // Consumed
    return task;
  }

  // Borrow (immutable reference)
  borrow(): Readonly<Task> {
    if (!this.task) {
      throw new Error('Task already transferred');
    }
    return this.task;
  }
}
```

### 5. Pattern Matching (Limited)

```typescript
// TypeScript doesn't have full pattern matching, but we can approximate
type TaskStatus = 'pending' | 'active' | 'completed' | 'archived';

function getTaskColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    'pending': 'gray',
    'active': 'blue',
    'completed': 'green',
    'archived': 'brown',
  };
  return colors[status];
}

// Or use exhaustive matching
function handleTaskStatus(status: TaskStatus): void {
  switch (status) {
    case 'pending':
      return handlePending();
    case 'active':
      return handleActive();
    case 'completed':
      return handleCompleted();
    case 'archived':
      return handleArchived();
    default:
      // TypeScript ensures this is unreachable
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
  }
}
```

---

## Event-Driven with FP

**RULE**: Use immutable domain events with functional transformations.

### Immutable Domain Events

```typescript
export interface DomainEvent {
  readonly type: string;
  readonly timestamp: string;
  readonly aggregateId: string;
  readonly payload: unknown;
}

export class TaskCreatedEvent implements DomainEvent {
  readonly type = 'TaskCreated';

  constructor(
    public readonly timestamp: string,
    public readonly aggregateId: string,
    public readonly payload: {
      readonly text: string;
      readonly date: string;
    }
  ) {}
}

export class TaskCompletedEvent implements DomainEvent {
  readonly type = 'TaskCompleted';

  constructor(
    public readonly timestamp: string,
    public readonly aggregateId: string,
    public readonly payload: {
      readonly completedAt: string;
    }
  ) {}
}
```

### Event Transformation Pipeline

```typescript
// Transform events with pure functions
const events: DomainEvent[] = [
  new TaskCreatedEvent('2024-01-15T10:00:00Z', '1', { text: 'Task 1', date: '2024-01-15' }),
  new TaskCompletedEvent('2024-01-15T11:00:00Z', '1', { completedAt: '2024-01-15T11:00:00Z' }),
  new TaskCreatedEvent('2024-01-15T12:00:00Z', '2', { text: 'Task 2', date: '2024-01-16' }),
];

// Filter events
const taskCreatedEvents = events.filter(e => e.type === 'TaskCreated');

// Map events to view models
const taskViews = taskCreatedEvents.map(e => ({
  id: e.aggregateId,
  text: (e.payload as { text: string }).text,
  createdAt: e.timestamp,
}));

// Reduce events to state
const taskState = events.reduce((state, event) => {
  switch (event.type) {
    case 'TaskCreated':
      return { ...state, [event.aggregateId]: { completed: false } };
    case 'TaskCompleted':
      return { ...state, [event.aggregateId]: { completed: true } };
    default:
      return state;
  }
}, {} as Record<string, { completed: boolean }>);
```

---

## Summary: Best Practices

✅ **DO**:
- Use classes for structure, pure functions for logic
- Prefer immutable data structures
- Use Result<T, E> for explicit error handling
- Use Option<T> instead of null/undefined
- Compose pure functions for reusability
- Leverage TypeScript's strict mode
- Make illegal states unrepresentable

❌ **NEVER**:
- Mutate objects or arrays
- Use any type
- Throw exceptions in business logic (use Result)
- Return null/undefined (use Option)
- Create functions with side effects
- Rely on global state

---

## Further Reading

- Functional Programming in TypeScript: https://gcanti.github.io/fp-ts/
- Rust Book: https://doc.rust-lang.org/book/
- Domain Modeling Made Functional: https://pragprog.com/titles/swdddf/domain-modeling-made-functional/
- Composing Software: https://medium.com/javascript-scene/composing-software-the-book-f31c77fc3ddc
