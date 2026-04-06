import { describe, expect, test } from 'bun:test';
import type {
    CreateRecurringTaskInput,
    RecurringFrequency,
    RecurringTask,
    RecurringTaskStats,
    UpdateRecurringTaskInput,
} from './recurringTask';

describe('RecurringTask types', () => {
    test('RecurringTask has all required fields', () => {
        const task: RecurringTask = {
            id: '1',
            text: 'Daily standup',
            notes: null,
            tags: ['#work'],
            frequency: 'daily',
            interval: 1,
            dayOfWeek: null,
            dayOfMonth: null,
            startDate: '2026-04-01',
            endDate: null,
            projectId: null,
            rolloverEnabled: true,
            createdAt: '2026-04-06T00:00:00.000Z',
            updatedAt: '2026-04-06T00:00:00.000Z',
        };
        expect(task.frequency).toBe('daily');
        expect(task.interval).toBe(1);
        expect(task.tags).toEqual(['#work']);
    });

    test('all four frequency values are valid', () => {
        const frequencies: RecurringFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];
        expect(frequencies).toHaveLength(4);
    });

    test('RecurringTaskStats has all required fields', () => {
        const stats: RecurringTaskStats = {
            recurringTaskId: '1',
            currentStreak: 5,
            longestStreak: 10,
            totalCompletions: 42,
            lastCompletedDate: '2026-04-05',
        };
        expect(stats.currentStreak).toBe(5);
        expect(stats.lastCompletedDate).toBe('2026-04-05');
    });

    test('RecurringTaskStats supports null lastCompletedDate', () => {
        const stats: RecurringTaskStats = {
            recurringTaskId: '1',
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            lastCompletedDate: null,
        };
        expect(stats.lastCompletedDate).toBeNull();
    });

    test('CreateRecurringTaskInput requires text, frequency, startDate', () => {
        const input: CreateRecurringTaskInput = {
            text: 'Weekly review',
            frequency: 'weekly',
            startDate: '2026-04-07',
        };
        expect(input.text).toBe('Weekly review');
        expect(input.frequency).toBe('weekly');
        expect(input.startDate).toBe('2026-04-07');
    });

    test('UpdateRecurringTaskInput is fully optional', () => {
        const input: UpdateRecurringTaskInput = { interval: 2 };
        expect(input.interval).toBe(2);
        expect(input.text).toBeUndefined();
    });
});
