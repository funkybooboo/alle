import { describe, expect, test } from 'bun:test';
import type { ActiveFilters, Task } from '@alle/shared';
import { applyFilters } from './filters';

const baseTask: Task = {
    id: '1',
    text: 'Test task',
    notes: null,
    completed: false,
    date: '2026-01-15',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
    tags: ['work', 'p1'],
    parentId: null,
    rolloverEnabled: true,
    someDayGroupId: null,
    position: 0,
    state: null,
    recurringTaskId: null,
    instanceDate: null,
    originalScheduledDate: null,
    daysLate: 0,
    dependsOn: null,
    startTime: null,
    endTime: null,
    reminder: null,
    deletedAt: null,
};

const noFilters: ActiveFilters = {
    tags: [],
    showCompleted: true,
};

describe('applyFilters', () => {
    test('returns all tasks when no filters are active', () => {
        const tasks = [baseTask];
        const result = applyFilters(tasks, noFilters);
        expect(result).toHaveLength(1);
    });

    test('filters by tag', () => {
        const tasks = [baseTask];
        const filters: ActiveFilters = { ...noFilters, tags: ['work'] };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(1);
    });

    test('excludes tasks that do not match tag filter', () => {
        const tasks = [baseTask];
        const filters: ActiveFilters = { ...noFilters, tags: ['home'] };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(0);
    });

    test('filters by project tag', () => {
        const projectTask = { ...baseTask, tags: ['work', 'p1', 'project:build-alle'] };
        const tasks = [projectTask];
        const filters: ActiveFilters = { ...noFilters, tags: ['project:build-alle'] };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(1);
    });

    test('excludes tasks without the project tag', () => {
        const tasks = [baseTask];
        const filters: ActiveFilters = { ...noFilters, tags: ['project:build-alle'] };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(0);
    });

    test('filters by priority tag (p1)', () => {
        const tasks = [baseTask];
        const filters: ActiveFilters = { ...noFilters, tags: ['p1'] };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(1);
    });

    test('excludes tasks without the priority tag', () => {
        const taskNoPriority = { ...baseTask, tags: ['work'] };
        const tasks = [taskNoPriority];
        const filters: ActiveFilters = { ...noFilters, tags: ['p1'] };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(0);
    });

    test('never hides completed tasks (showCompleted is ignored)', () => {
        const completedTask = { ...baseTask, completed: true };
        const tasks = [baseTask, completedTask];
        const filters: ActiveFilters = { ...noFilters, showCompleted: false };
        const result = applyFilters(tasks, filters);
        // Completed tasks always stay visible -- nothing is hidden in the UI.
        expect(result).toHaveLength(2);
    });

    test('applies multiple tag filters together (OR logic)', () => {
        const task1 = baseTask;
        const task2 = { ...baseTask, id: '2', tags: ['work'] };
        const task3 = { ...baseTask, id: '3', tags: ['home'] };
        const tasks = [task1, task2, task3];
        const filters: ActiveFilters = { ...noFilters, tags: ['work'] };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(2);
        expect(result.every(t => t.tags.includes('work'))).toBe(true);
    });
});
