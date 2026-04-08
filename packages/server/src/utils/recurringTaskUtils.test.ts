import { describe, expect, it } from 'bun:test';
import type { RecurringTask } from '@alle/shared';
import { generateOccurrences } from './recurringTaskUtils';

function makeTask(overrides: Partial<RecurringTask> = {}): RecurringTask {
    return {
        id: 'rt-1',
        text: 'Test task',
        notes: null,
        tags: [],
        frequency: 'daily',
        interval: 1,
        dayOfWeek: null,
        dayOfMonth: null,
        startDate: '2026-01-01',
        endDate: null,
        projectId: null,
        rolloverEnabled: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('generateOccurrences', () => {
    describe('daily', () => {
        it('generates occurrences for a simple daily task', () => {
            const rt = makeTask({ frequency: 'daily', interval: 1, startDate: '2026-01-01' });
            const result = generateOccurrences(rt, '2026-01-03', '2026-01-05');
            expect(result).toEqual(['2026-01-03', '2026-01-04', '2026-01-05']);
        });

        it('respects interval > 1', () => {
            const rt = makeTask({ frequency: 'daily', interval: 2, startDate: '2026-01-01' });
            const result = generateOccurrences(rt, '2026-01-01', '2026-01-07');
            expect(result).toEqual(['2026-01-01', '2026-01-03', '2026-01-05', '2026-01-07']);
        });

        it('returns empty array when range is before template start', () => {
            const rt = makeTask({ frequency: 'daily', interval: 1, startDate: '2026-02-01' });
            const result = generateOccurrences(rt, '2026-01-01', '2026-01-31');
            expect(result).toEqual([]);
        });

        it('returns empty array when range is after template end', () => {
            const rt = makeTask({
                frequency: 'daily',
                interval: 1,
                startDate: '2026-01-01',
                endDate: '2026-01-05',
            });
            const result = generateOccurrences(rt, '2026-01-10', '2026-01-15');
            expect(result).toEqual([]);
        });

        it('clamps to template end date', () => {
            const rt = makeTask({
                frequency: 'daily',
                interval: 1,
                startDate: '2026-01-01',
                endDate: '2026-01-03',
            });
            const result = generateOccurrences(rt, '2026-01-01', '2026-01-10');
            expect(result).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
        });

        it('includes start and end dates when they are occurrences', () => {
            const rt = makeTask({ frequency: 'daily', interval: 1, startDate: '2026-01-01' });
            const result = generateOccurrences(rt, '2026-01-05', '2026-01-05');
            expect(result).toEqual(['2026-01-05']);
        });
    });

    describe('weekly', () => {
        it('generates weekly occurrences', () => {
            const rt = makeTask({ frequency: 'weekly', interval: 1, startDate: '2026-01-05' });
            const result = generateOccurrences(rt, '2026-01-05', '2026-02-02');
            expect(result).toEqual([
                '2026-01-05',
                '2026-01-12',
                '2026-01-19',
                '2026-01-26',
                '2026-02-02',
            ]);
        });

        it('respects interval for biweekly', () => {
            const rt = makeTask({ frequency: 'weekly', interval: 2, startDate: '2026-01-05' });
            const result = generateOccurrences(rt, '2026-01-05', '2026-02-02');
            expect(result).toEqual(['2026-01-05', '2026-01-19', '2026-02-02']);
        });
    });

    describe('monthly', () => {
        it('generates monthly occurrences', () => {
            const rt = makeTask({ frequency: 'monthly', interval: 1, startDate: '2026-01-15' });
            const result = generateOccurrences(rt, '2026-01-15', '2026-04-15');
            expect(result).toEqual(['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15']);
        });
    });

    describe('yearly', () => {
        it('generates yearly occurrences', () => {
            const rt = makeTask({ frequency: 'yearly', interval: 1, startDate: '2026-03-01' });
            const result = generateOccurrences(rt, '2026-03-01', '2028-03-01');
            expect(result).toEqual(['2026-03-01', '2027-03-01', '2028-03-01']);
        });
    });

    describe('edge cases', () => {
        it('returns empty array when startDate > endDate', () => {
            const rt = makeTask({ frequency: 'daily', interval: 1, startDate: '2026-01-01' });
            const result = generateOccurrences(rt, '2026-01-10', '2026-01-05');
            expect(result).toEqual([]);
        });

        it('uses interval of 1 when interval is 0 (defensive)', () => {
            const rt = makeTask({ frequency: 'daily', interval: 0, startDate: '2026-01-01' });
            const result = generateOccurrences(rt, '2026-01-01', '2026-01-03');
            expect(result).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
        });
    });
});
