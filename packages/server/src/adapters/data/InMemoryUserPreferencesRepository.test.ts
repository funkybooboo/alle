import { describe, expect, test } from 'bun:test';
import { NativeDateProvider } from '@alle/shared';
import { InMemoryUserPreferencesRepository } from './InMemoryUserPreferencesRepository';

function makeRepo() {
    return new InMemoryUserPreferencesRepository(new NativeDateProvider());
}

describe('InMemoryUserPreferencesRepository', () => {
    describe('get', () => {
        test('returns sensible defaults when preferences have never been set', async () => {
            const repo = makeRepo();
            const prefs = await repo.get();
            expect(prefs.id).toBe('default');
            expect(prefs.theme).toBe('system');
            expect(prefs.locale).toBe('en');
            expect(prefs.someDayPanelWidth).toBeGreaterThan(0);
            expect(prefs.someDayPanelCollapsed).toBe(false);
            expect(prefs.rolloverEnabled).toBe(true);
            expect(prefs.showEmptyDays).toBe(true);
            expect(prefs.activeFilters.tags).toEqual([]);
            expect(prefs.activeFilters.projectId).toBeNull();
            expect(prefs.activeFilters.priority).toBeNull();
            expect(prefs.activeFilters.showCompleted).toBe(false);
        });
    });

    describe('update', () => {
        test('merges partial updates without clobbering other fields', async () => {
            const repo = makeRepo();
            await repo.update({ theme: 'dark' });
            const prefs = await repo.get();
            expect(prefs.theme).toBe('dark');
            expect(prefs.locale).toBe('en'); // unchanged
        });

        test('merges activeFilters as a whole object', async () => {
            const repo = makeRepo();
            await repo.update({
                activeFilters: {
                    tags: ['#work'],
                    projectId: 'p1',
                    priority: '#p1',
                    showCompleted: true,
                },
            });
            const prefs = await repo.get();
            expect(prefs.activeFilters.tags).toEqual(['#work']);
            expect(prefs.activeFilters.projectId).toBe('p1');
        });

        test('updates updatedAt on each call', async () => {
            const repo = makeRepo();
            await repo.update({ theme: 'light' });
            const after = await repo.get();
            expect(after.updatedAt).toBeDefined();
            expect(typeof after.updatedAt).toBe('string');
        });
    });

    describe('reset', () => {
        test('restores default preferences', async () => {
            const repo = makeRepo();
            await repo.update({ theme: 'dark', locale: 'fr' });
            await repo.reset();
            const prefs = await repo.get();
            expect(prefs.theme).toBe('system');
            expect(prefs.locale).toBe('en');
        });
    });
});
