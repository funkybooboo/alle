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
            expect(prefs.activeFilters.showCompleted).toBe(true);
            expect(prefs.collapsedSections).toEqual([]);
            expect(prefs.tagKinds.length).toBeGreaterThan(0);
            expect(prefs.tagKindMap).toBeDefined();
        });
    });

    describe('update', () => {
        test('merges partial updates without clobbering other fields', async () => {
            const repo = makeRepo();
            await repo.update({ theme: 'dark' });
            const prefs = await repo.get();
            expect(prefs.theme).toBe('dark');
            expect(prefs.locale).toBe('en');
        });

        test('merges activeFilters as a whole object', async () => {
            const repo = makeRepo();
            await repo.update({
                activeFilters: {
                    tags: ['work', 'p1'],
                    projectId: null,
                    priority: null,
                    showCompleted: true,
                },
            });
            const prefs = await repo.get();
            expect(prefs.activeFilters.tags).toEqual(['work', 'p1']);
        });

        test('updates tagKinds and tagKindMap', async () => {
            const repo = makeRepo();
            await repo.update({
                tagKinds: [
                    {
                        id: 'priority',
                        name: 'Priority',
                        behavior: 'single',
                        prefix: null,
                        sortOrder: 0,
                        color: null,
                    },
                    {
                        id: 'context',
                        name: 'Context',
                        behavior: 'multiple',
                        prefix: null,
                        sortOrder: 1,
                        color: null,
                    },
                ],
                tagKindMap: { p1: 'priority', p2: 'priority', work: 'context' },
            });
            const prefs = await repo.get();
            expect(prefs.tagKinds.length).toBe(2);
            expect(prefs.tagKinds[1]?.name).toBe('Context');
            expect(prefs.tagKindMap?.['work']).toBe('context');
        });

        test('updates updatedAt on each call', async () => {
            const repo = makeRepo();
            await repo.update({ theme: 'light' });
            const after = await repo.get();
            expect(after.updatedAt).toBeDefined();
            expect(typeof after.updatedAt).toBe('string');
        });

        test('persists collapsedSections', async () => {
            const repo = makeRepo();
            await repo.update({ collapsedSections: ['day-2026-01-01', 'someday-abc'] });
            const prefs = await repo.get();
            expect(prefs.collapsedSections).toEqual(['day-2026-01-01', 'someday-abc']);
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

    describe('collapsedSections', () => {
        test('persists collapsed sections', async () => {
            const repo = makeRepo();
            await repo.update({ collapsedSections: ['day-2026-01-01', 'someday-group-abc'] });
            const prefs = await repo.get();
            expect(prefs.collapsedSections).toEqual(['day-2026-01-01', 'someday-group-abc']);
        });

        test('replaces collapsed sections on update', async () => {
            const repo = makeRepo();
            await repo.update({ collapsedSections: ['day-2026-01-01'] });
            await repo.update({ collapsedSections: ['day-2026-01-02'] });
            const prefs = await repo.get();
            expect(prefs.collapsedSections).toEqual(['day-2026-01-02']);
        });
    });

    describe('someDayPanelLastOpenWidth', () => {
        test('persists last open width', async () => {
            const repo = makeRepo();
            await repo.update({ someDayPanelLastOpenWidth: 350 });
            const prefs = await repo.get();
            expect(prefs.someDayPanelLastOpenWidth).toBe(350);
        });

        test('defaults to 280', async () => {
            const repo = makeRepo();
            const prefs = await repo.get();
            expect(prefs.someDayPanelLastOpenWidth).toBe(280);
        });
    });

    describe('activeFilters with projectId and priority', () => {
        test('persists projectId filter', async () => {
            const repo = makeRepo();
            await repo.update({
                activeFilters: {
                    tags: [],
                    projectId: 'proj-123',
                    priority: null,
                    showCompleted: true,
                },
            });
            const prefs = await repo.get();
            expect(prefs.activeFilters.projectId).toBe('proj-123');
            expect(prefs.activeFilters.priority).toBeNull();
        });

        test('persists priority filter', async () => {
            const repo = makeRepo();
            await repo.update({
                activeFilters: {
                    tags: [],
                    projectId: null,
                    priority: 'p1',
                    showCompleted: true,
                },
            });
            const prefs = await repo.get();
            expect(prefs.activeFilters.priority).toBe('p1');
            expect(prefs.activeFilters.projectId).toBeNull();
        });
    });
});
