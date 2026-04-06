import { describe, expect, test } from 'bun:test';
import type { RecurringTaskStats } from '@alle/shared';
import { NativeDateProvider } from '@alle/shared';
import { InMemoryRecurringTaskRepository } from './InMemoryRecurringTaskRepository';

function makeRepo() {
    return new InMemoryRecurringTaskRepository(new NativeDateProvider());
}

describe('InMemoryRecurringTaskRepository', () => {
    describe('create', () => {
        test('creates with generated id and timestamps, sensible defaults', async () => {
            const repo = makeRepo();
            const task = await repo.create({
                text: 'Daily standup',
                frequency: 'daily',
                startDate: '2026-04-01',
            });
            expect(task.id).toBeDefined();
            expect(task.createdAt).toBeDefined();
            expect(task.updatedAt).toBeDefined();
            expect(task.text).toBe('Daily standup');
            expect(task.frequency).toBe('daily');
            expect(task.interval).toBe(1);
            expect(task.notes).toBeNull();
            expect(task.tags).toEqual([]);
            expect(task.dayOfWeek).toBeNull();
            expect(task.dayOfMonth).toBeNull();
            expect(task.endDate).toBeNull();
            expect(task.projectId).toBeNull();
            expect(task.rolloverEnabled).toBe(true);
        });

        test('creates with optional fields', async () => {
            const repo = makeRepo();
            const task = await repo.create({
                text: 'Weekly review',
                frequency: 'weekly',
                startDate: '2026-04-07',
                tags: ['#work'],
                interval: 2,
                dayOfWeek: 1,
                rolloverEnabled: false,
            });
            expect(task.tags).toEqual(['#work']);
            expect(task.interval).toBe(2);
            expect(task.dayOfWeek).toBe(1);
            expect(task.rolloverEnabled).toBe(false);
        });
    });

    describe('findAll', () => {
        test('returns empty array when none exist', async () => {
            const repo = makeRepo();
            expect(await repo.findAll()).toEqual([]);
        });

        test('returns all recurring tasks', async () => {
            const repo = makeRepo();
            await repo.create({ text: 'A', frequency: 'daily', startDate: '2026-04-01' });
            await repo.create({ text: 'B', frequency: 'weekly', startDate: '2026-04-01' });
            expect((await repo.findAll()).length).toBe(2);
        });
    });

    describe('findById', () => {
        test('returns null for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.findById('nope')).toBeNull();
        });

        test('returns the task when found', async () => {
            const repo = makeRepo();
            const created = await repo.create({
                text: 'A',
                frequency: 'daily',
                startDate: '2026-04-01',
            });
            expect(await repo.findById(created.id)).toEqual(created);
        });
    });

    describe('update', () => {
        test('returns null for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.update('nope', { text: 'New' })).toBeNull();
        });

        test('updates provided fields and refreshes updatedAt', async () => {
            const repo = makeRepo();
            const created = await repo.create({
                text: 'Original',
                frequency: 'daily',
                startDate: '2026-04-01',
            });
            const updated = await repo.update(created.id, { text: 'Updated', interval: 3 });
            expect(updated?.text).toBe('Updated');
            expect(updated?.interval).toBe(3);
            expect(updated?.frequency).toBe('daily');
        });
    });

    describe('delete', () => {
        test('returns false for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.delete('nope')).toBe(false);
        });

        test('returns true and removes the task', async () => {
            const repo = makeRepo();
            const task = await repo.create({
                text: 'A',
                frequency: 'daily',
                startDate: '2026-04-01',
            });
            expect(await repo.delete(task.id)).toBe(true);
            expect(await repo.findById(task.id)).toBeNull();
        });
    });

    describe('stats', () => {
        test('findStats returns null when no stats exist', async () => {
            const repo = makeRepo();
            expect(await repo.findStats('unknown')).toBeNull();
        });

        test('upsertStats creates stats entry', async () => {
            const repo = makeRepo();
            const task = await repo.create({
                text: 'A',
                frequency: 'daily',
                startDate: '2026-04-01',
            });
            const stats: RecurringTaskStats = {
                recurringTaskId: task.id,
                currentStreak: 3,
                longestStreak: 5,
                totalCompletions: 10,
                lastCompletedDate: '2026-04-05',
            };
            await repo.upsertStats(stats);
            expect(await repo.findStats(task.id)).toEqual(stats);
        });

        test('upsertStats updates existing stats', async () => {
            const repo = makeRepo();
            const task = await repo.create({
                text: 'A',
                frequency: 'daily',
                startDate: '2026-04-01',
            });
            const initial: RecurringTaskStats = {
                recurringTaskId: task.id,
                currentStreak: 1,
                longestStreak: 1,
                totalCompletions: 1,
                lastCompletedDate: '2026-04-04',
            };
            await repo.upsertStats(initial);
            const updated: RecurringTaskStats = {
                recurringTaskId: task.id,
                currentStreak: 2,
                longestStreak: 2,
                totalCompletions: 2,
                lastCompletedDate: '2026-04-05',
            };
            await repo.upsertStats(updated);
            expect(await repo.findStats(task.id)).toEqual(updated);
        });
    });

    describe('deleteAll', () => {
        test('clears both tasks and stats', async () => {
            const repo = makeRepo();
            const task = await repo.create({
                text: 'A',
                frequency: 'daily',
                startDate: '2026-04-01',
            });
            await repo.upsertStats({
                recurringTaskId: task.id,
                currentStreak: 1,
                longestStreak: 1,
                totalCompletions: 1,
                lastCompletedDate: null,
            });
            await repo.deleteAll();
            expect(await repo.findAll()).toEqual([]);
            expect(await repo.findStats(task.id)).toBeNull();
        });
    });
});
