import { expect, test } from '@playwright/test';
import { get, patch } from './helpers';

test.describe('user preferences — GET /api/preferences', () => {
    test('returns the default preferences singleton', async ({ request }) => {
        const res = await get(request, '/api/preferences');
        expect(res.status).toBe(200);
        const prefs = res.body.data;
        expect(prefs.id).toBe('default');
        expect(['light', 'dark', 'system']).toContain(prefs.theme);
        expect(['instant', 'confirm']).toContain(prefs.deleteConfirmation);
        expect(['12h', '24h']).toContain(prefs.timeFormat);
        expect(prefs.activeFilters).toHaveProperty('tags');
        expect(prefs.activeFilters).toHaveProperty('showCompleted');
        expect(Array.isArray(prefs.tagKinds)).toBe(true);
    });
});

test.describe('user preferences — PATCH /api/preferences', () => {
    test('updates a single field and returns the merged preferences', async ({ request }) => {
        // Get current value to restore later.
        const before = await get(request, '/api/preferences');
        const origTheme = before.body.data.theme;

        const res = await patch(request, '/api/preferences', { theme: 'dark' });
        expect(res.status).toBe(200);
        expect(res.body.data.theme).toBe('dark');
        // Unchanged fields preserved.
        expect(res.body.data.id).toBe('default');

        // Restore to avoid leaking state across tests.
        await patch(request, '/api/preferences', { theme: origTheme });
    });

    test('updates nested activeFilters', async ({ request }) => {
        const before = await get(request, '/api/preferences');
        const orig = before.body.data.activeFilters;

        const res = await patch(request, '/api/preferences', {
            activeFilters: { tags: ['#test'], showCompleted: false },
        });
        expect(res.status).toBe(200);
        expect(res.body.data.activeFilters.tags).toEqual(['#test']);
        expect(res.body.data.activeFilters.showCompleted).toBe(false);

        // Restore.
        await patch(request, '/api/preferences', { activeFilters: orig });
    });

    test('updates someDayPanelWidth within bounds', async ({ request }) => {
        const before = await get(request, '/api/preferences');
        const orig = before.body.data.someDayPanelWidth;

        const res = await patch(request, '/api/preferences', { someDayPanelWidth: 400 });
        expect(res.status).toBe(200);
        expect(res.body.data.someDayPanelWidth).toBe(400);

        await patch(request, '/api/preferences', { someDayPanelWidth: orig });
    });

    test('rejects invalid theme with 400', async ({ request }) => {
        const res = await patch(request, '/api/preferences', { theme: 'neon' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details?.fields).toHaveProperty('theme');
    });

    test('rejects someDayPanelWidth over 800 with 400', async ({ request }) => {
        const res = await patch(request, '/api/preferences', { someDayPanelWidth: 801 });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('rejects someDayPanelWidth < 0 with 400', async ({ request }) => {
        const res = await patch(request, '/api/preferences', { someDayPanelWidth: -1 });
        expect(res.status).toBe(400);
    });

    test('rejects invalid deleteConfirmation enum with 400', async ({ request }) => {
        const res = await patch(request, '/api/preferences', { deleteConfirmation: 'maybe' });
        expect(res.status).toBe(400);
    });
});

test.describe('user preferences — content negotiation', () => {
    test('Accept: text/plain returns formatted preferences text', async ({ request }) => {
        const res = await get(request, '/api/preferences', { Accept: 'text/plain' });
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('string');
        expect(res.body).toContain('theme:');
        expect(res.body).toContain('locale:');
        expect(res.body).toContain('rolloverEnabled:');
        expect(res.body).toContain('showEmptyDays:');
        expect(res.body).toContain('someDayPanelWidth:');
    });
});