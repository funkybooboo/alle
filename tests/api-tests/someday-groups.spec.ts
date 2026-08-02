import { expect, test } from '@playwright/test';
import { cleanup, createGroup, del, get, post, put, uniq } from './helpers';

test.afterEach(async ({ request }) => {
    await cleanup(request);
});

test.describe('someday-groups — create (POST /api/someday-groups)', () => {
    test('creates a group with all fields', async ({ request }) => {
        const res = await post(request, '/api/someday-groups', {
            name: 'Reading list',
            tag: 'reading',
            position: 0,
            description: 'Books to read',
        });
        expect(res.status).toBe(201);
        const g = res.body.data;
        expect(g.id).toBeTruthy();
        expect(g.name).toBe('Reading list');
        expect(g.tag).toBe('reading');
        expect(g.position).toBe(0);
        expect(g.description).toBe('Books to read');
        expect(g.createdAt).toBeTruthy();
    });

    test('creates a group with null description', async ({ request }) => {
        const res = await post(request, '/api/someday-groups', {
            name: 'No desc',
            tag: 'nodesc',
            position: 1,
        });
        expect(res.status).toBe(201);
        expect(res.body.data.description).toBeNull();
    });

    test('rejects empty name with 400', async ({ request }) => {
        const res = await post(request, '/api/someday-groups', {
            name: '',
            tag: 'x',
            position: 0,
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details?.fields).toHaveProperty('name');
    });

    test('rejects empty tag with 400', async ({ request }) => {
        const res = await post(request, '/api/someday-groups', {
            name: 'Has name',
            tag: '',
            position: 0,
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details?.fields).toHaveProperty('tag');
    });

    test('rejects negative position with 400', async ({ request }) => {
        const res = await post(request, '/api/someday-groups', {
            name: 'Bad pos',
            tag: 'pos',
            position: -1,
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('rejects name over 100 chars', async ({ request }) => {
        const res = await post(request, '/api/someday-groups', {
            name: 'x'.repeat(101),
            tag: 'long',
            position: 0,
        });
        expect(res.status).toBe(400);
    });
});

test.describe('someday-groups — list & by id', () => {
    test('GET /api/someday-groups returns all', async ({ request }) => {
        await createGroup(request, { name: uniq('Group'), tag: uniq('g'), position: 0 });
        const res = await get(request, '/api/someday-groups');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET by id returns the group', async ({ request }) => {
        const g = await createGroup(request, { name: 'Get me', tag: 'getme', position: 0 });
        const res = await get(request, `/api/someday-groups/${g.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(g.id);
    });

    test('GET unknown id returns 404', async ({ request }) => {
        const res = await get(request, '/api/someday-groups/999999');
        expect(res.status).toBe(404);
    });
});

test.describe('someday-groups — update', () => {
    test('PUT updates name, tag, description, position', async ({ request }) => {
        const g = await createGroup(request, { name: 'Orig', tag: 'orig', position: 0 });
        const res = await put(request, `/api/someday-groups/${g.id}`, {
            name: 'Edited',
            tag: 'edited',
            description: 'new desc',
            position: 2,
        });
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Edited');
        expect(res.body.data.tag).toBe('edited');
        expect(res.body.data.description).toBe('new desc');
        expect(res.body.data.position).toBe(2);
    });

    test('PUT with empty name returns 400', async ({ request }) => {
        const g = await createGroup(request, { name: 'Keep', tag: 'keep', position: 0 });
        const res = await put(request, `/api/someday-groups/${g.id}`, { name: '' });
        expect(res.status).toBe(400);
    });

    test('PUT unknown id returns 404', async ({ request }) => {
        const res = await put(request, '/api/someday-groups/999999', { name: 'x' });
        expect(res.status).toBe(404);
    });
});

test.describe('someday-groups — delete', () => {
    test('DELETE removes the group', async ({ request }) => {
        const g = await createGroup(request, { name: 'Delete me', tag: 'del', position: 0 });
        const res = await del(request, `/api/someday-groups/${g.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({ success: true });
        const getRes = await get(request, `/api/someday-groups/${g.id}`);
        expect(getRes.status).toBe(404);
    });

    test('DELETE unknown id returns 404', async ({ request }) => {
        const res = await del(request, '/api/someday-groups/999999');
        expect(res.status).toBe(404);
    });
});

test.describe('someday-groups — content negotiation', () => {
    test('Accept: text/plain returns formatted text', async ({ request }) => {
        await createGroup(request, { name: 'Plain group', tag: 'plain', position: 1 });
        const res = await get(request, '/api/someday-groups', { Accept: 'text/plain' });
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('string');
        expect(res.body).toContain('Plain group');
        expect(res.body).toContain('#plain');
    });
});