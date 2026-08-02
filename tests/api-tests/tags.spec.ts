import { expect, test } from '@playwright/test';
import { cleanup, createTask, del, get, post } from './helpers';

test.afterEach(async ({ request }) => {
    await cleanup(request);
});

test.describe('tags — list (GET /api/tags)', () => {
    test('returns the sorted union of all task tags', async ({ request }) => {
        await createTask(request, { text: 'A', date: '2026-05-01', tags: ['#zebra', '#alpha'] });
        await createTask(request, { text: 'B', date: '2026-05-01', tags: ['#mango'] });
        const res = await get(request, '/api/tags');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        const tags = res.body.data;
        expect(tags).toContain('#alpha');
        expect(tags).toContain('#mango');
        expect(tags).toContain('#zebra');
        // Sorted alphabetically.
        for (let i = 1; i < tags.length; i++) {
            expect(tags[i] >= tags[i - 1]).toBe(true);
        }
    });

    test('returns no duplicates across tasks sharing a tag', async ({ request }) => {
        await createTask(request, { text: 'A', date: '2026-05-01', tags: ['#shared'] });
        await createTask(request, { text: 'B', date: '2026-05-01', tags: ['#shared'] });
        const res = await get(request, '/api/tags');
        expect(res.status).toBe(200);
        const occurrences = res.body.data.filter((t: string) => t === '#shared');
        expect(occurrences).toHaveLength(1);
    });
});

test.describe('tags — info (GET /api/tags/info)', () => {
    test('returns per-tag counts sorted by name', async ({ request }) => {
        await createTask(request, { text: 'A', date: '2026-05-01', tags: ['#alpha', '#beta'] });
        await createTask(request, { text: 'B', date: '2026-05-01', tags: ['#alpha'] });
        const res = await get(request, '/api/tags/info');
        expect(res.status).toBe(200);
        const info = res.body.data;
        const alpha = info.find((t: { name: string }) => t.name === '#alpha');
        const beta = info.find((t: { name: string }) => t.name === '#beta');
        expect(alpha.count).toBe(2);
        expect(beta.count).toBe(1);
        // Sorted by name.
        for (let i = 1; i < info.length; i++) {
            expect(info[i].name >= info[i - 1].name).toBe(true);
        }
    });
});

test.describe('tags — rename (POST /api/tags/rename)', () => {
    test('renames a tag across all affected tasks', async ({ request }) => {
        await createTask(request, { text: 'A', date: '2026-05-01', tags: ['#old'] });
        await createTask(request, { text: 'B', date: '2026-05-01', tags: ['#old', '#keep'] });
        const res = await post(request, '/api/tags/rename', { from: '#old', to: '#new' });
        expect(res.status).toBe(200);
        expect(res.body.data.updated).toBe(2);
        const tags = await get(request, '/api/tags');
        expect(tags.body.data).toContain('#new');
        expect(tags.body.data).not.toContain('#old');
        expect(tags.body.data).toContain('#keep');
    });

    test('returns updated: 0 when the tag does not exist', async ({ request }) => {
        const res = await post(request, '/api/tags/rename', { from: '#nope', to: '#yep' });
        expect(res.status).toBe(200);
        expect(res.body.data.updated).toBe(0);
    });

    test('rejects empty from/to with 400', async ({ request }) => {
        const res = await post(request, '/api/tags/rename', { from: '', to: '#x' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });
});

test.describe('tags — merge (POST /api/tags/merge)', () => {
    test('merges multiple source tags into the target', async ({ request }) => {
        await createTask(request, { text: 'A', date: '2026-05-01', tags: ['#src1'] });
        await createTask(request, { text: 'B', date: '2026-05-01', tags: ['#src2'] });
        await createTask(request, { text: 'C', date: '2026-05-01', tags: ['#src1', '#src2'] });
        const res = await post(request, '/api/tags/merge', {
            sources: ['#src1', '#src2'],
            target: '#dest',
        });
        expect(res.status).toBe(200);
        expect(res.body.data.updated).toBe(3);
        const tags = await get(request, '/api/tags');
        expect(tags.body.data).toContain('#dest');
        expect(tags.body.data).not.toContain('#src1');
        expect(tags.body.data).not.toContain('#src2');
    });

    test('does not duplicate the target tag on a task that already has it', async ({ request }) => {
        await createTask(request, { text: 'A', date: '2026-05-01', tags: ['#dest', '#src'] });
        const res = await post(request, '/api/tags/merge', {
            sources: ['#src'],
            target: '#dest',
        });
        expect(res.status).toBe(200);
        // Verify the task has #dest exactly once (no dup).
        const tasks = await get(request, '/api/tasks?tag=%23dest');
        const t = tasks.body.data.find((x: { text: string }) => x.text === 'A');
        expect(t.tags.filter((x: string) => x === '#dest')).toHaveLength(1);
    });

    test('rejects empty sources array with 400', async ({ request }) => {
        const res = await post(request, '/api/tags/merge', { sources: [], target: '#dest' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('rejects empty target with 400', async ({ request }) => {
        const res = await post(request, '/api/tags/merge', { sources: ['#src'], target: '' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });
});

test.describe('tags — content negotiation', () => {
    test('GET /api/tags Accept: text/plain returns newline-joined tags', async ({ request }) => {
        await createTask(request, { text: 'A', date: '2026-05-01', tags: ['#alpha', '#beta'] });
        const res = await get(request, '/api/tags', { Accept: 'text/plain' });
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('string');
        expect(res.body).toContain('#alpha');
        expect(res.body).toContain('#beta');
    });

    test('GET /api/tags/info Accept: text/plain returns name (count) lines', async ({ request }) => {
        await createTask(request, { text: 'A', date: '2026-05-01', tags: ['#alpha'] });
        const res = await get(request, '/api/tags/info', { Accept: 'text/plain' });
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('string');
        expect(res.body).toContain('#alpha (1)');
    });
});