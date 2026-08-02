import { expect, test } from '@playwright/test';
import { cleanup, createProject, del, get, post, put, uniq } from './helpers';

test.afterEach(async ({ request }) => {
    await cleanup(request);
});

test.describe('projects — create (POST /api/projects)', () => {
    test('creates a project with auto-generated tag', async ({ request }) => {
        const res = await post(request, '/api/projects', { name: 'Build ALLe' });
        expect(res.status).toBe(201);
        const p = res.body.data;
        expect(p.id).toBeTruthy();
        expect(p.name).toBe('Build ALLe');
        expect(p.tag).toBe('project:build-alle');
        expect(p.isActive).toBe(true);
        expect(p.description).toBeNull();
        expect(p.completedAt).toBeNull();
    });

    test('accepts explicit tag, description, and dates', async ({ request }) => {
        const res = await post(request, '/api/projects', {
            name: 'Custom',
            tag: 'project:custom',
            description: 'desc',
            startDate: '2026-01-01',
            dueDate: '2026-12-31',
        });
        expect(res.status).toBe(201);
        expect(res.body.data.tag).toBe('project:custom');
        expect(res.body.data.description).toBe('desc');
        expect(res.body.data.startDate).toBe('2026-01-01');
        expect(res.body.data.dueDate).toBe('2026-12-31');
    });

    test('rejects empty name with 400 VALIDATION_ERROR', async ({ request }) => {
        const res = await post(request, '/api/projects', { name: '' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details?.fields).toHaveProperty('name');
    });

    test('rejects name over 200 chars', async ({ request }) => {
        const res = await post(request, '/api/projects', { name: 'x'.repeat(201) });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });
});

test.describe('projects — list (GET /api/projects)', () => {
    test('returns all projects', async ({ request }) => {
        await createProject(request, { name: uniq('Proj') });
        const res = await get(request, '/api/projects');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('?active=true returns only active projects', async ({ request }) => {
        const a = await createProject(request, { name: uniq('Active') });
        const b = await createProject(request, { name: uniq('Inactive') });
        await post(request, `/api/projects/${b.id}/deactivate`);
        const res = await get(request, '/api/projects?active=true');
        expect(res.status).toBe(200);
        const ids = res.body.data.map((p: { id: string }) => p.id);
        expect(ids).toContain(a.id);
        expect(ids).not.toContain(b.id);
    });
});

test.describe('projects — by id', () => {
    test('GET /api/projects/:id returns the project', async ({ request }) => {
        const p = await createProject(request, { name: 'Get proj' });
        const res = await get(request, `/api/projects/${p.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(p.id);
    });

    test('GET unknown id returns 404', async ({ request }) => {
        const res = await get(request, '/api/projects/999999');
        expect(res.status).toBe(404);
    });

    test('PUT updates name and description', async ({ request }) => {
        const p = await createProject(request, { name: 'Rename me' });
        const res = await put(request, `/api/projects/${p.id}`, {
            name: 'Renamed',
            description: 'new',
        });
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Renamed');
        expect(res.body.data.description).toBe('new');
    });

    test('PUT with empty name returns 400', async ({ request }) => {
        const p = await createProject(request, { name: 'Keep' });
        const res = await put(request, `/api/projects/${p.id}`, { name: '' });
        expect(res.status).toBe(400);
    });

    test('PUT unknown id returns 404', async ({ request }) => {
        const res = await put(request, '/api/projects/999999', { name: 'x' });
        expect(res.status).toBe(404);
    });
});

test.describe('projects — activate / deactivate', () => {
    test('deactivate then activate toggles isActive', async ({ request }) => {
        const p = await createProject(request, { name: 'Toggle' });
        const off = await post(request, `/api/projects/${p.id}/deactivate`);
        expect(off.status).toBe(200);
        expect(off.body.data.isActive).toBe(false);
        const on = await post(request, `/api/projects/${p.id}/activate`);
        expect(on.status).toBe(200);
        expect(on.body.data.isActive).toBe(true);
    });

    test('deactivate unknown id returns 404', async ({ request }) => {
        const res = await post(request, '/api/projects/999999/deactivate');
        expect(res.status).toBe(404);
    });

    test('activate unknown id returns 404', async ({ request }) => {
        const res = await post(request, '/api/projects/999999/activate');
        expect(res.status).toBe(404);
    });
});

test.describe('projects — delete', () => {
    test('DELETE removes the project', async ({ request }) => {
        const p = await createProject(request, { name: 'Delete me' });
        const res = await del(request, `/api/projects/${p.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual({ success: true });
        const getRes = await get(request, `/api/projects/${p.id}`);
        expect(getRes.status).toBe(404);
    });

    test('DELETE unknown id returns 404', async ({ request }) => {
        const res = await del(request, '/api/projects/999999');
        expect(res.status).toBe(404);
    });
});

test.describe('projects — content negotiation', () => {
    test('Accept: text/plain returns formatted text', async ({ request }) => {
        await createProject(request, { name: 'Plain proj' });
        const res = await get(request, '/api/projects', { Accept: 'text/plain' });
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('string');
        expect(res.body).toContain('Plain proj');
        expect(res.body).toMatch(/\[active\]/);
    });
});