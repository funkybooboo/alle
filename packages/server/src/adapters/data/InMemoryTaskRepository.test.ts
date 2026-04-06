import { describe, expect, test } from 'bun:test';
import { NativeDateProvider } from '@alle/shared';
import { InMemoryTaskRepository } from './InMemoryTaskRepository';

function makeRepo() {
    return new InMemoryTaskRepository(new NativeDateProvider());
}

describe('InMemoryTaskRepository', () => {
    describe('create', () => {
        test('creates a task with all default fields', async () => {
            const repo = makeRepo();
            const task = await repo.create({ text: 'Buy milk', date: '2026-04-06' });
            expect(task.id).toBeDefined();
            expect(task.createdAt).toBeDefined();
            expect(task.updatedAt).toBeDefined();
            expect(task.text).toBe('Buy milk');
            expect(task.date).toBe('2026-04-06');
            expect(task.completed).toBe(false);
            expect(task.notes).toBeNull();
            expect(task.tags).toEqual([]);
            expect(task.parentId).toBeNull();
            expect(task.rolloverEnabled).toBe(false);
            expect(task.someDayGroupId).toBeNull();
            expect(task.projectId).toBeNull();
            expect(task.position).toBeNull();
            expect(task.state).toBeNull();
            expect(task.recurringTaskId).toBeNull();
            expect(task.instanceDate).toBeNull();
            expect(task.originalScheduledDate).toBeNull();
            expect(task.daysLate).toBe(0);
            expect(task.dependsOn).toBeNull();
            expect(task.startTime).toBeNull();
            expect(task.endTime).toBeNull();
            expect(task.reminder).toBeNull();
        });

        test('preserves explicit values from input', async () => {
            const repo = makeRepo();
            const task = await repo.create({
                text: 'Team meeting',
                date: '2026-04-06',
                tags: ['#work', '#p1'],
                notes: 'Agenda: sprint review',
                startTime: '09:00',
                endTime: '10:00',
                someDayGroupId: 'g1',
                projectId: 'proj1',
                rolloverEnabled: true,
                state: 'scheduled',
            });
            expect(task.tags).toEqual(['#work', '#p1']);
            expect(task.notes).toBe('Agenda: sprint review');
            expect(task.startTime).toBe('09:00');
            expect(task.endTime).toBe('10:00');
            expect(task.someDayGroupId).toBe('g1');
            expect(task.projectId).toBe('proj1');
            expect(task.rolloverEnabled).toBe(true);
            expect(task.state).toBe('scheduled');
        });

        test('creates a Someday task with date: null', async () => {
            const repo = makeRepo();
            const task = await repo.create({ text: 'Learn piano', date: null });
            expect(task.date).toBeNull();
        });

        test('assigns unique sequential ids', async () => {
            const repo = makeRepo();
            const a = await repo.create({ text: 'A', date: '2026-04-06' });
            const b = await repo.create({ text: 'B', date: '2026-04-06' });
            expect(a.id).not.toBe(b.id);
        });
    });

    describe('findById', () => {
        test('returns null for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.findById('nope')).toBeNull();
        });

        test('returns the task when found', async () => {
            const repo = makeRepo();
            const created = await repo.create({ text: 'Test', date: '2026-04-06' });
            expect(await repo.findById(created.id)).toEqual(created);
        });
    });

    describe('update', () => {
        test('returns null for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.update('nope', { text: 'New' })).toBeNull();
        });

        test('merges only provided fields', async () => {
            const repo = makeRepo();
            const created = await repo.create({
                text: 'Original',
                date: '2026-04-06',
                tags: ['#work'],
            });
            const updated = await repo.update(created.id, { completed: true });
            expect(updated?.completed).toBe(true);
            expect(updated?.text).toBe('Original');
            expect(updated?.tags).toEqual(['#work']);
        });

        test('can move a task to Someday by setting date to null', async () => {
            const repo = makeRepo();
            const created = await repo.create({ text: 'Task', date: '2026-04-06' });
            const updated = await repo.update(created.id, { date: null });
            expect(updated?.date).toBeNull();
        });
    });

    describe('delete', () => {
        test('returns false for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.delete('nope')).toBe(false);
        });

        test('returns true and removes the task', async () => {
            const repo = makeRepo();
            const task = await repo.create({ text: 'Delete me', date: '2026-04-06' });
            expect(await repo.delete(task.id)).toBe(true);
            expect(await repo.findById(task.id)).toBeNull();
        });
    });

    describe('deleteAll', () => {
        test('empties the store', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'A', date: '2026-04-06' });
            await repo.create({ text: 'B', date: '2026-04-07' });
            await repo.deleteAll();
            expect(await repo.findAll()).toEqual([]);
        });
    });

    describe('findAll', () => {
        test('returns empty array when no tasks exist', async () => {
            const repo = makeRepo();
            expect(await repo.findAll()).toEqual([]);
        });

        test('sorts dated tasks before Someday (null-date) tasks', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'Someday task', date: null });
            await repo.create({ text: 'Today task', date: '2026-04-06' });
            const tasks = await repo.findAll();
            expect(tasks[0]?.text).toBe('Today task');
            expect(tasks[1]?.text).toBe('Someday task');
        });

        test('sorts dated tasks by date ascending', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'Tomorrow', date: '2026-04-07' });
            await repo.create({ text: 'Today', date: '2026-04-06' });
            const tasks = await repo.findAll();
            expect(tasks[0]?.text).toBe('Today');
            expect(tasks[1]?.text).toBe('Tomorrow');
        });
    });

    describe('findByDate', () => {
        test('returns only tasks matching the given date', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'Today', date: '2026-04-06' });
            await repo.create({ text: 'Tomorrow', date: '2026-04-07' });
            await repo.create({ text: 'Someday', date: null });
            const results = await repo.findByDate('2026-04-06');
            expect(results.length).toBe(1);
            expect(results[0]?.text).toBe('Today');
        });
    });

    describe('findSomeday', () => {
        test('returns only tasks with date: null', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'Scheduled', date: '2026-04-06' });
            await repo.create({ text: 'Unscheduled A', date: null });
            await repo.create({ text: 'Unscheduled B', date: null });
            const results = await repo.findSomeday();
            expect(results.length).toBe(2);
            expect(results.every(t => t.date === null)).toBe(true);
        });

        test('returns empty array when no Someday tasks exist', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'Scheduled', date: '2026-04-06' });
            expect(await repo.findSomeday()).toEqual([]);
        });
    });

    describe('findBySomeDayGroup', () => {
        test('returns tasks belonging to a specific group', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'In group', date: null, someDayGroupId: 'g1' });
            await repo.create({ text: 'Other group', date: null, someDayGroupId: 'g2' });
            await repo.create({ text: 'No group', date: null });
            const results = await repo.findBySomeDayGroup('g1');
            expect(results.length).toBe(1);
            expect(results[0]?.text).toBe('In group');
        });
    });

    describe('findChildren', () => {
        test('returns direct children of a parent task', async () => {
            const repo = makeRepo();
            const parent = await repo.create({ text: 'Parent', date: '2026-04-06' });
            await repo.create({ text: 'Child 1', date: '2026-04-06', parentId: parent.id });
            await repo.create({ text: 'Child 2', date: '2026-04-06', parentId: parent.id });
            await repo.create({ text: 'Unrelated', date: '2026-04-06' });
            const children = await repo.findChildren(parent.id);
            expect(children.length).toBe(2);
            expect(children.every(c => c.parentId === parent.id)).toBe(true);
        });

        test('returns empty array when parent has no children', async () => {
            const repo = makeRepo();
            const task = await repo.create({ text: 'Lone task', date: '2026-04-06' });
            expect(await repo.findChildren(task.id)).toEqual([]);
        });

        test('deleting parent does not cascade to children', async () => {
            const repo = makeRepo();
            const parent = await repo.create({ text: 'Parent', date: '2026-04-06' });
            await repo.create({ text: 'Child', date: '2026-04-06', parentId: parent.id });
            await repo.delete(parent.id);
            const children = await repo.findChildren(parent.id);
            expect(children.length).toBe(1); // child still exists
        });
    });

    describe('findByTags', () => {
        test('returns all tasks when tags array is empty', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'A', date: '2026-04-06', tags: ['#work'] });
            await repo.create({ text: 'B', date: '2026-04-06', tags: [] });
            const results = await repo.findByTags([]);
            expect(results.length).toBe(2);
        });

        test('returns tasks containing the tag (single tag)', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'Work task', date: '2026-04-06', tags: ['#work'] });
            await repo.create({ text: 'Personal task', date: '2026-04-06', tags: ['#personal'] });
            await repo.create({ text: 'Untagged', date: '2026-04-06', tags: [] });
            const results = await repo.findByTags(['#work']);
            expect(results.length).toBe(1);
            expect(results[0]?.text).toBe('Work task');
        });

        test('uses OR semantics for multiple tags', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'Work task', date: '2026-04-06', tags: ['#work'] });
            await repo.create({ text: 'Urgent task', date: '2026-04-06', tags: ['#urgent'] });
            await repo.create({ text: 'Both', date: '2026-04-06', tags: ['#work', '#urgent'] });
            await repo.create({ text: 'Other', date: '2026-04-06', tags: ['#personal'] });
            const results = await repo.findByTags(['#work', '#urgent']);
            expect(results.length).toBe(3); // 'Work task', 'Urgent task', 'Both'
        });

        test('returns empty array when no tasks match', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'Task', date: '2026-04-06', tags: ['#work'] });
            expect(await repo.findByTags(['#nonexistent'])).toEqual([]);
        });
    });
});
