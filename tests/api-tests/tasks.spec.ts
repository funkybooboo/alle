import { expect, test } from '@playwright/test';
import {
    cleanup,
    createGroup,
    createTask,
    del,
    get,
    post,
    put,
    uniq,
} from './helpers';

test.afterEach(async ({ request }) => {
    await cleanup(request);
});

test.describe('tasks — create (POST /api/tasks)', () => {
    test('creates a dated task with defaults', async ({ request }) => {
        const res = await post(request, '/api/tasks', {
            text: 'Buy milk',
            date: '2026-04-06',
        });
        expect(res.status).toBe(201);
        const task = res.body.data;
        expect(task.id).toBeTruthy();
        expect(task.text).toBe('Buy milk');
        expect(task.date).toBe('2026-04-06');
        expect(task.completed).toBe(false);
        expect(task.tags).toEqual([]);
        expect(task.notes).toBeNull();
        expect(task.parentId).toBeNull();
        expect(task.deletedAt).toBeNull();
        expect(task.createdAt).toBeTruthy();
        expect(task.updatedAt).toBe(task.createdAt);
    });

    test('creates a Someday task with date: null', async ({ request }) => {
        const res = await post(request, '/api/tasks', { text: 'Learn piano', date: null });
        expect(res.status).toBe(201);
        expect(res.body.data.date).toBeNull();
    });

    test('preserves explicit tags, notes, and start/end times', async ({ request }) => {
        const res = await post(request, '/api/tasks', {
            text: 'Team meeting',
            date: '2026-04-06',
            tags: ['#work', '#p1'],
            notes: 'Agenda: sprint review',
            startTime: '09:00',
            endTime: '10:00',
            rolloverEnabled: true,
        });
        expect(res.status).toBe(201);
        expect(res.body.data.tags).toEqual(['#work', '#p1']);
        expect(res.body.data.notes).toBe('Agenda: sprint review');
        expect(res.body.data.startTime).toBe('09:00');
        expect(res.body.data.endTime).toBe('10:00');
        expect(res.body.data.rolloverEnabled).toBe(true);
    });

    test('rejects empty text with 400 VALIDATION_ERROR', async ({ request }) => {
        const res = await post(request, '/api/tasks', { text: '', date: '2026-04-06' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeTruthy();
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details?.fields).toHaveProperty('text');
    });

    test('rejects text exceeding MAX_TEXT_LENGTH (500)', async ({ request }) => {
        const res = await post(request, '/api/tasks', { text: 'x'.repeat(501), date: '2026-04-06' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('rejects invalid time format (HH:MM regex)', async ({ request }) => {
        const res = await post(request, '/api/tasks', {
            text: 'Bad time',
            date: '2026-04-06',
            startTime: '9:00',
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details?.fields).toHaveProperty('startTime');
    });

    test('accepts explicit position and someDayGroupId', async ({ request }) => {
        const group = await createGroup(request, {
            name: uniq('Group'),
            tag: uniq('g'),
            position: 0,
        });
        const res = await post(request, '/api/tasks', {
            text: 'Grouped task',
            date: null,
            someDayGroupId: group.id,
            position: 5,
        });
        expect(res.status).toBe(201);
        expect(res.body.data.someDayGroupId).toBe(group.id);
        expect(res.body.data.position).toBe(5);
    });
});

test.describe('tasks — list (GET /api/tasks)', () => {
    test('returns all tasks wrapped in { data }', async ({ request }) => {
        await createTask(request, { text: uniq('List A'), date: '2026-05-01' });
        const res = await get(request, '/api/tasks');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some((t: { text: string }) => t.text.includes('List A'))).toBe(true);
    });

    test('filters by date (?date=...)', async ({ request }) => {
        await createTask(request, { text: 'on-date', date: '2026-05-10' });
        await createTask(request, { text: 'other-date', date: '2026-05-11' });
        const res = await get(request, '/api/tasks?date=2026-05-10');
        expect(res.status).toBe(200);
        const texts = res.body.data.map((t: { text: string }) => t.text);
        expect(texts).toContain('on-date');
        expect(texts).not.toContain('other-date');
    });

    test('filters by tag (?tag=...)', async ({ request }) => {
        await createTask(request, { text: 'tagged', date: '2026-05-10', tags: ['#urgent'] });
        await createTask(request, { text: 'untagged', date: '2026-05-10' });
        const res = await get(request, '/api/tasks?tag=%23urgent');
        expect(res.status).toBe(200);
        const texts = res.body.data.map((t: { text: string }) => t.text);
        expect(texts).toContain('tagged');
        expect(texts).not.toContain('untagged');
    });

    test('filters Someday tasks (?someday=true)', async ({ request }) => {
        await createTask(request, { text: 'someday-item', date: null });
        await createTask(request, { text: 'dated-item', date: '2026-05-10' });
        const res = await get(request, '/api/tasks?someday=true');
        expect(res.status).toBe(200);
        const texts = res.body.data.map((t: { text: string }) => t.text);
        expect(texts).toContain('someday-item');
        expect(texts).not.toContain('dated-item');
    });

    test('filters by completion (?completed=false)', async ({ request }) => {
        const t1 = await createTask(request, { text: 'incomplete', date: '2026-05-10' });
        const t2 = await createTask(request, { text: 'complete', date: '2026-05-10' });
        await put(request, `/api/tasks/${t2.id}`, { completed: true });
        const res = await get(request, '/api/tasks?completed=false');
        expect(res.status).toBe(200);
        const texts = res.body.data.map((t: { text: string }) => t.text);
        expect(texts).toContain('incomplete');
        expect(texts).not.toContain('complete');
    });

    test('does not include soft-deleted tasks by default', async ({ request }) => {
        const t = await createTask(request, { text: 'will-delete', date: '2026-05-10' });
        await del(request, `/api/tasks/${t.id}`);
        const res = await get(request, '/api/tasks');
        expect(res.status).toBe(200);
        expect(res.body.data.every((x: { id: string }) => x.id !== t.id)).toBe(true);
    });
});

test.describe('tasks — get by id (GET /api/tasks/:id)', () => {
    test('returns the task', async ({ request }) => {
        const t = await createTask(request, { text: 'Get me', date: '2026-05-11' });
        const res = await get(request, `/api/tasks/${t.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(t.id);
        expect(res.body.data.text).toBe('Get me');
    });

    test('returns 404 for unknown id', async ({ request }) => {
        const res = await get(request, '/api/tasks/999999');
        expect(res.status).toBe(404);
        expect(res.body.code).toBe('NOT_FOUND');
        expect(res.body.error.toLowerCase()).toContain('not found');
    });
});

test.describe('tasks — update (PUT /api/tasks/:id)', () => {
    test('updates text, tags, notes, and completed', async ({ request }) => {
        const t = await createTask(request, { text: 'Original', date: '2026-05-11' });
        const res = await put(request, `/api/tasks/${t.id}`, {
            text: 'Edited',
            tags: ['#new'],
            notes: 'updated notes',
            completed: true,
        });
        expect(res.status).toBe(200);
        expect(res.body.data.text).toBe('Edited');
        expect(res.body.data.tags).toEqual(['#new']);
        expect(res.body.data.notes).toBe('updated notes');
        expect(res.body.data.completed).toBe(true);
    });

    test('bumps updatedAt on mutation', async ({ request }) => {
        const t = await createTask(request, { text: 'Bump', date: '2026-05-11' });
        const res = await put(request, `/api/tasks/${t.id}`, { text: 'Bumped' });
        expect(res.status).toBe(200);
        expect(res.body.data.updatedAt >= t.updatedAt).toBe(true);
    });

    test('rejects invalid update body (empty text) with 400', async ({ request }) => {
        const t = await createTask(request, { text: 'Keep', date: '2026-05-11' });
        const res = await put(request, `/api/tasks/${t.id}`, { text: '' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('returns 404 for unknown id', async ({ request }) => {
        const res = await put(request, '/api/tasks/999999', { completed: true });
        expect(res.status).toBe(404);
    });

    test('parent auto-completes when all children completed (rollup)', async ({ request }) => {
        const parent = await createTask(request, { text: 'Parent', date: '2026-05-11' });
        const child1 = await createTask(request, {
            text: 'Child 1',
            date: '2026-05-11',
            parentId: parent.id,
        });
        const child2 = await createTask(request, {
            text: 'Child 2',
            date: '2026-05-11',
            parentId: parent.id,
        });
        // Complete child 1 — parent should NOT complete yet
        const r1 = await put(request, `/api/tasks/${child1.id}`, { completed: true });
        expect(r1.body.data.completed).toBe(true);
        const parentMid = await get(request, `/api/tasks/${parent.id}`);
        expect(parentMid.body.data.completed).toBe(false);
        // Complete child 2 — now parent should auto-complete
        await put(request, `/api/tasks/${child2.id}`, { completed: true });
        const parentFinal = await get(request, `/api/tasks/${parent.id}`);
        expect(parentFinal.body.data.completed).toBe(true);
    });
});

test.describe('tasks — delete / trash / restore / purge', () => {
    test('soft-delete hides from default list but keeps gettable? no — 404 after delete', async ({
        request,
    }) => {
        const t = await createTask(request, { text: 'Delete me', date: '2026-05-12' });
        const delRes = await del(request, `/api/tasks/${t.id}`);
        expect(delRes.status).toBe(200);
        expect(delRes.body.data).toEqual({ success: true });
        const getRes = await get(request, `/api/tasks/${t.id}`);
        expect(getRes.status).toBe(404);
    });

    test('GET /api/tasks/trash lists soft-deleted tasks', async ({ request }) => {
        const t = await createTask(request, { text: 'Trashed', date: '2026-05-12' });
        await del(request, `/api/tasks/${t.id}`);
        const res = await get(request, '/api/tasks/trash');
        expect(res.status).toBe(200);
        expect(res.body.data.some((x: { id: string }) => x.id === t.id)).toBe(true);
        expect(res.body.data.every((x: { deletedAt: string | null }) => x.deletedAt !== null)).toBe(true);
    });

    test('POST /api/tasks/:id/restore brings a task back', async ({ request }) => {
        const t = await createTask(request, { text: 'Restore me', date: '2026-05-12' });
        await del(request, `/api/tasks/${t.id}`);
        const res = await post(request, `/api/tasks/${t.id}/restore`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(t.id);
        expect(res.body.data.deletedAt).toBeNull();
        const getRes = await get(request, `/api/tasks/${t.id}`);
        expect(getRes.status).toBe(200);
    });

    test('restore of a non-deleted task returns 404', async ({ request }) => {
        const t = await createTask(request, { text: 'Not deleted', date: '2026-05-12' });
        const res = await post(request, `/api/tasks/${t.id}/restore`);
        expect(res.status).toBe(404);
    });

    test('DELETE unknown id returns 404', async ({ request }) => {
        const res = await del(request, '/api/tasks/999999');
        expect(res.status).toBe(404);
    });

    test('DELETE /api/tasks/purge removes soft-deleted tasks and returns count', async ({
        request,
    }) => {
        const t = await createTask(request, { text: 'Purge me', date: '2026-05-12' });
        await del(request, `/api/tasks/${t.id}`);
        const res = await del(request, '/api/tasks/purge');
        expect(res.status).toBe(200);
        expect(typeof res.body.data.purged).toBe('number');
        // Note: purge only removes deletedAt older than PURGE_RETENTION_DAYS (7),
        // so freshly-deleted tasks may not be purged immediately. We assert the
        // endpoint contracts and that it doesn't error.
    });
});

test.describe('tasks — content negotiation', () => {
    test('Accept: text/plain returns formatted plain text', async ({ request }) => {
        await createTask(request, { text: 'Plain task', date: '2026-05-13' });
        const res = await get(request, '/api/tasks', { Accept: 'text/plain' });
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('string');
        expect(res.body).toContain('Plain task');
        expect(res.body).toContain('[ ]');
    });

    test('Accept: application/json (default) returns JSON', async ({ request }) => {
        await createTask(request, { text: 'Json task', date: '2026-05-13' });
        const res = await get(request, '/api/tasks');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});