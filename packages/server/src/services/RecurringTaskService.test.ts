import { describe, expect, it } from 'bun:test';
import type { CreateTaskInput, RecurringTask, Task } from '@alle/shared';
import { NotFoundError } from '@alle/shared';
import { RecurringTaskService } from './RecurringTaskService';

// Minimal fakes — just the methods the service calls. The real
// InMemoryTaskRepository/RecurringTaskRepository have their own test files.

class FakeTaskRepository {
    tasks: Task[] = [];
    counter = 0;
    create(input: CreateTaskInput): Promise<Task> {
        const now = '2026-01-01T00:00:00.000Z';
        const task: Task = {
            id: `t-${++this.counter}`,
            text: input.text,
            notes: input.notes ?? null,
            completed: false,
            date: input.date,
            createdAt: now,
            updatedAt: now,
            tags: input.tags ?? [],
            parentId: input.parentId ?? null,
            rolloverEnabled: input.rolloverEnabled ?? false,
            someDayGroupId: input.someDayGroupId ?? null,
            position: input.position ?? null,
            state: input.state ?? null,
            recurringTaskId: input.recurringTaskId ?? null,
            instanceDate: input.instanceDate ?? null,
            originalScheduledDate: null,
            daysLate: 0,
            dependsOn: null,
            startTime: input.startTime ?? null,
            endTime: input.endTime ?? null,
            reminder: input.reminder ?? null,
            deletedAt: null,
        };
        this.tasks.push(task);
        return Promise.resolve(task);
    }
}

class FakeRecurringTaskRepository {
    store = new Map<string, RecurringTask>();
    findById(id: string): Promise<RecurringTask | null> {
        return Promise.resolve(this.store.get(id) ?? null);
    }
}

function makeRecurringTask(overrides: Partial<RecurringTask> = {}): RecurringTask {
    return {
        id: 'rt-1',
        text: 'Standup',
        notes: null,
        tags: ['#work'],
        frequency: 'daily',
        interval: 1,
        dayOfWeek: null,
        dayOfMonth: null,
        startDate: '2026-01-01',
        endDate: null,
        rolloverEnabled: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('RecurringTaskService', () => {
    describe('generateInstances', () => {
        it('links each generated task back to the template via recurringTaskId', async () => {
            const taskRepo = new FakeTaskRepository();
            const recurringRepo = new FakeRecurringTaskRepository();
            const rt = makeRecurringTask({ id: 'rt-9' });
            recurringRepo.store.set(rt.id, rt);

            const service = new RecurringTaskService(recurringRepo as never, taskRepo as never);

            const created = await service.generateInstances(rt.id, '2026-03-02', '2026-03-04');
            expect(created).toHaveLength(3);
            for (const task of created) {
                expect(task.recurringTaskId).toBe(rt.id);
                expect(task.instanceDate).toBe(task.date);
            }
        });

        it('copies the template text, tags, notes, and rolloverEnabled', async () => {
            const taskRepo = new FakeTaskRepository();
            const recurringRepo = new FakeRecurringTaskRepository();
            const rt = makeRecurringTask({
                id: 'rt-1',
                text: 'Quiz',
                notes: 'bring pen',
                tags: ['#school'],
                rolloverEnabled: false,
            });
            recurringRepo.store.set(rt.id, rt);

            const service = new RecurringTaskService(recurringRepo as never, taskRepo as never);

            const created = await service.generateInstances(rt.id, '2026-04-01', '2026-04-01');
            expect(created).toHaveLength(1);
            for (const task of created) {
                expect(task.text).toBe('Quiz');
                expect(task.notes).toBe('bring pen');
                expect(task.tags).toEqual(['#school']);
                expect(task.rolloverEnabled).toBe(false);
            }
        });

        it('throws NotFoundError when the template does not exist', async () => {
            const taskRepo = new FakeTaskRepository();
            const recurringRepo = new FakeRecurringTaskRepository();
            const service = new RecurringTaskService(recurringRepo as never, taskRepo as never);

            await expect(
                service.generateInstances('missing', '2026-03-02', '2026-03-04'),
            ).rejects.toThrow(NotFoundError);
        });
    });
});
