import { describe, expect, test } from 'bun:test';
import type { ActiveFilters, UpdateUserPreferencesInput, UserPreferences } from './userPreferences';

describe('UserPreferences types', () => {
    test('UserPreferences has all required fields with correct defaults shape', () => {
        const prefs: UserPreferences = {
            id: 'default',
            theme: 'system',
            locale: 'en',
            someDayPanelWidth: 300,
            someDayPanelCollapsed: false,
            rolloverEnabled: true,
            showEmptyDays: true,
            activeFilters: {
                tags: [],
                projectId: null,
                priority: null,
                showCompleted: false,
            },
            updatedAt: '2026-04-06T00:00:00.000Z',
        };
        expect(prefs.id).toBe('default');
        expect(prefs.theme).toBe('system');
        expect(prefs.activeFilters.tags).toEqual([]);
    });

    test('ActiveFilters has all required fields', () => {
        const filters: ActiveFilters = {
            tags: ['#work'],
            projectId: 'p1',
            priority: '#p1',
            showCompleted: true,
        };
        expect(filters.tags).toEqual(['#work']);
        expect(filters.projectId).toBe('p1');
    });

    test('UpdateUserPreferencesInput is fully optional', () => {
        const input: UpdateUserPreferencesInput = { theme: 'dark' };
        expect(input.theme).toBe('dark');
        expect(input.locale).toBeUndefined();
    });

    test('UpdateUserPreferencesInput supports partial activeFilters', () => {
        const input: UpdateUserPreferencesInput = {
            activeFilters: {
                tags: ['#work'],
                projectId: null,
                priority: null,
                showCompleted: false,
            },
        };
        expect(input.activeFilters?.tags).toEqual(['#work']);
    });
});
