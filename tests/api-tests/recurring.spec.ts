import { expect, test } from '@playwright/test';
import {
    cleanup,
    createRecurring,
    del,
    get,
    post,
    put,
} from './helpers';

test.afterEach(async ({ request }) => {
    await cleanup(request);
});

test.describe('recurring-tasks — create (POST /api/recurring-tasks)', () => {
    test('creates a daily recurring task with defaults', async ({ request }) => {
        const res = await post(request, '/api/recurring-tasks', {
            text: 'Standup',
            frequency: 'daily',
            startDate: '2026-01-01',
        });
        expect(res.status).toBe(201);
        const rt = res.body.data;
        expect(rt.id).toBeTruthy();
        expect(rt.text).toBe('Standup');
        expect(rt.frequency).toBe('daily');
        expect(rt.interval).toBe(1);
        expect(rt.rolloverEnabled).toBe(true);
        expect(rt.tags).toEqual([]);
        expect(rt.endDate).toBeNull();
    });

    test('accepts weekly with dayOfWeek and interval', async ({ request }) => {
        const res = await post(request, '/api/recurring-tasks', {
            text: 'Biweekly review',
            frequency: 'weekly',
            interval: 2,
            dayOfWeek: 1,
            startDate: '2026-01-05',
        });
        expect(res.status).toBe(201);
        expect(res.body.data.interval).toBe(2);
        expect(res.body.data.dayOfWeek).toBe(1);
    });

    test('rejects invalid frequency enum', async ({ request }) => {
        const res = await post(request, '/api/recurring-tasks', {
            text: 'Bad',
            frequency: 'hourly',
            startDate: '2026-01-01',
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details?.fields).toHaveProperty('frequency');
    });

    test('rejects bad date format (non-ISO)', async ({ request }) => {
        const res = await post(request, '/api/recurring-tasks', {
            text: 'Bad date',
            frequency: 'daily',
            startDate: '01-01-2026',
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details?.fields).toHaveProperty('startDate');
    });

    test('rejects interval < 1', async ({ request }) => {
        const res = await post(request, '/api/recurring-tasks', {
            text: 'Zero interval',
            frequency: 'daily',
            interval: 0,
            startDate: '2026-01-01',
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('rejects dayOfWeek out of range (> 6)', async ({ request }) => {
        const res = await post(request, '/api/recurring-tasks', {
            text: 'Bad dow',
            frequency: 'weekly',
            dayOfWeek: 7,
            startDate: '2026-01-01',
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });
});

test.describe('recurring-tasks — list & by id', () => {
    test('GET /api/recurring-tasks returns all', async ({ request }) => {
        await createRecurring(request, {
            text: 'List rt',
            frequency: 'daily',
            startDate: '2026-01-01',
        });
        const res = await get(request, '/api/recurring-tasks');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET by id returns the recurring task', async ({ request }) => {
        const rt = await createRecurring(request, {
            text: 'Get me',
            frequency: 'daily',
            startDate: '2026-01-01',
        });
        const res = await get(request, `/api/recurring-tasks/${rt.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(rt.id);
    });

    test('GET unknown id returns 404', async ({ request }) => {
        const res = await get(request, '/api/recurring-tasks/999999');
        expect(res.status).toBe(404);
    });
});

test.describe('recurring-tasks — update', () => {
    test('PUT updates text and interval', async ({ request }) => {
        const rt = await createRecurring(request, {
            text: 'Original',
            frequency: 'daily',
            startDate: '2026-01-01',
        });
        const res = await put(request, `/api/recurring-tasks/${rt.id}`, {
            text: 'Edited',
            interval: 3,
        });
        expect(res.status).toBe(200);
        expect(res.body.data.text).toBe('Edited');
        expect(res.body.data.interval).toBe(3);
    });

    test('PUT unknown id returns 404', async ({ request }) => {
        const res = await put(request, '/api/recurring-tasks/999999', { text: 'x' });
        expect(res.status).toBe(404);
    });

    test('PUT with invalid frequency returns 400', async ({ request }) => {
        const rt = await createRecurring(request, {
            text: 'Keep',
            frequency: 'daily',
            startDate: '2026-01-01',
        });
        const res = await put(request, `/api/recurring-tasks/${rt.id}`, {
            frequency: 'hourly',
        });
        expect(res.status).toBe(400);
    });
});

test.describe('recurring-tasks — delete', () => {
    test('DELETE removes the recurring task', async ({ request }) => {
        const rt = await createRecurring(request, {
            text: 'Delete me',
            frequency: 'daily',
            startDate: '2026-01-01',
        });
        const res = await del(request, `/api/recurring-tasks/${rt.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({ success: true });
        const getRes = await get(request, `/api/recurring-tasks/${rt.id}`);
        expect(getRes.status).toBe(404);
    });

    test('DELETE unknown id returns 404', async ({ request }) => {
        const res = await del(request, '/api/recurring-tasks/999999');
        expect(res.status).toBe(404);
    });
});

test.describe('recurring-tasks — generate instances', () => {
    test('creates task instances for each occurrence in range', async ({ request }) => {
        const rt = await createRecurring(request, {
            text: 'Daily standup',
            frequency: 'daily',
            interval: 1,
            startDate: '2026-01-01',
        });
        const res = await post(request, `/api/recurring-tasks/${rt.id}/generate`, {
            startDate: '2026-03-02',
            endDate: '2026-03-04',
        });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(3);
        const dates = res.body.data.map((t: { date: string }) => t.date).sort();
        expect(dates).toEqual(['2026-03-02', '2026-03-03', '2026-03-04']);
        for (const t of res.body.data) {
            expect(t.text).toBe('Daily standup');
            // Generated instances are linked back to their recurring template so
            // TaskRow can render the recurring icon and completion stats can
            // group by template.
            expect(t.recurringTaskId).toBe(rt.id);
            expect(t.instanceDate).toBe(t.date);
        }
    });

    test('respects interval > 1 (every 2 days)', async ({ request }) => {
        const rt = await createRecurring(request, {
            text: 'Bi-daily',
            frequency: 'daily',
            interval: 2,
            startDate: '2026-01-01',
        });
        const res = await post(request, `/api/recurring-tasks/${rt.id}/generate`, {
            startDate: '2026-03-01',
            endDate: '2026-03-07',
        });
        expect(res.status).toBe(200);
        const dates = res.body.data.map((t: { date: string }) => t.date).sort();
        // Occurrences phase from the Jan 1 anchor (every 2 days). In a Mar 1-7
        // window the in-range even-offset dates are Mar 2, 4, 6.
        expect(dates).toEqual(['2026-03-02', '2026-03-04', '2026-03-06']);
    });

    test('returns 404 for unknown recurring task id', async ({ request }) => {
        const res = await post(request, '/api/recurring-tasks/999999/generate', {
            startDate: '2026-03-01',
            endDate: '2026-03-02',
        });
        expect(res.status).toBe(404);
    });

    test('rejects invalid date format with 400', async ({ request }) => {
        const rt = await createRecurring(request, {
            text: 'Bad gen',
            frequency: 'daily',
            startDate: '2026-01-01',
        });
        const res = await post(request, `/api/recurring-tasks/${rt.id}/generate`, {
            startDate: 'not-a-date',
            endDate: '2026-03-02',
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });
});