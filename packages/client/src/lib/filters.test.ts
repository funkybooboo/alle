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
    projectId: null,
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
    projectId: null,
    priority: null,
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

    test('hides completed tasks when showCompleted is false', () => {
        const completedTask = { ...baseTask, completed: true };
        const tasks = [baseTask, completedTask];
        const filters: ActiveFilters = { ...noFilters, showCompleted: false };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(1);
        expect(result[0].completed).toBe(false);
    });

    test('filters by projectId', () => {
        const tasks = [{ ...baseTask, projectId: 'proj-123' }];
        const filters: ActiveFilters = { ...noFilters, projectId: 'proj-123' };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(1);
    });

    test('excludes tasks with different projectId', () => {
        const tasks = [{ ...baseTask, projectId: 'proj-456' }];
        const filters: ActiveFilters = { ...noFilters, projectId: 'proj-123' };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(0);
    });

    test('excludes tasks with null projectId when filtering by project', () => {
        const tasks = [baseTask]; // projectId is null
        const filters: ActiveFilters = { ...noFilters, projectId: 'proj-123' };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(0);
    });

    test('filters by priority', () => {
        const tasks = [baseTask]; // has p1 tag
        const filters: ActiveFilters = { ...noFilters, priority: 'p1' };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(1);
    });

    test('excludes tasks without the priority tag', () => {
        const taskNoPriority = { ...baseTask, tags: ['work'] };
        const tasks = [taskNoPriority];
        const filters: ActiveFilters = { ...noFilters, priority: 'p1' };
        const result = applyFilters(tasks, filters);
        expect(result).toHaveLength(0);
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
