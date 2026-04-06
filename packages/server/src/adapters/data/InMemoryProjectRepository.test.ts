import { describe, expect, test } from 'bun:test';
import { NativeDateProvider } from '@alle/shared';
import { InMemoryProjectRepository } from './InMemoryProjectRepository';

function makeRepo() {
    return new InMemoryProjectRepository(new NativeDateProvider());
}

describe('InMemoryProjectRepository', () => {
    describe('create', () => {
        test('creates with generated id, createdAt, isActive: true, completedAt: null', async () => {
            const repo = makeRepo();
            const project = await repo.create({ name: 'My Project' });
            expect(project.id).toBeDefined();
            expect(project.createdAt).toBeDefined();
            expect(project.name).toBe('My Project');
            expect(project.isActive).toBe(true);
            expect(project.completedAt).toBeNull();
            expect(project.description).toBeNull();
            expect(project.startDate).toBeNull();
            expect(project.dueDate).toBeNull();
        });

        test('creates with optional fields', async () => {
            const repo = makeRepo();
            const project = await repo.create({
                name: 'Full Project',
                description: 'Has all fields',
                startDate: '2026-04-01',
                dueDate: '2026-04-30',
            });
            expect(project.description).toBe('Has all fields');
            expect(project.startDate).toBe('2026-04-01');
            expect(project.dueDate).toBe('2026-04-30');
        });
    });

    describe('findAll', () => {
        test('returns empty array when no projects exist', async () => {
            const repo = makeRepo();
            expect(await repo.findAll()).toEqual([]);
        });

        test('returns all projects', async () => {
            const repo = makeRepo();
            await repo.create({ name: 'A' });
            await repo.create({ name: 'B' });
            expect((await repo.findAll()).length).toBe(2);
        });
    });

    describe('findActive', () => {
        test('returns only active projects', async () => {
            const repo = makeRepo();
            const active = await repo.create({ name: 'Active' });
            const inactive = await repo.create({ name: 'Inactive' });
            await repo.update(inactive.id, { isActive: false });
            const results = await repo.findActive();
            expect(results.length).toBe(1);
            expect(results[0]?.id).toBe(active.id);
        });
    });

    describe('findById', () => {
        test('returns null for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.findById('nope')).toBeNull();
        });

        test('returns the project when found', async () => {
            const repo = makeRepo();
            const created = await repo.create({ name: 'Test' });
            expect(await repo.findById(created.id)).toEqual(created);
        });
    });

    describe('update', () => {
        test('returns null for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.update('nope', { name: 'New' })).toBeNull();
        });

        test('updates only provided fields', async () => {
            const repo = makeRepo();
            const created = await repo.create({ name: 'Original' });
            const updated = await repo.update(created.id, {
                isActive: false,
                completedAt: '2026-04-06T00:00:00.000Z',
            });
            expect(updated?.isActive).toBe(false);
            expect(updated?.completedAt).toBe('2026-04-06T00:00:00.000Z');
            expect(updated?.name).toBe('Original');
        });
    });

    describe('delete', () => {
        test('returns false for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.delete('nope')).toBe(false);
        });

        test('returns true and removes the project', async () => {
            const repo = makeRepo();
            const project = await repo.create({ name: 'Test' });
            expect(await repo.delete(project.id)).toBe(true);
            expect(await repo.findById(project.id)).toBeNull();
        });
    });

    describe('deleteAll', () => {
        test('empties the store', async () => {
            const repo = makeRepo();
            await repo.create({ name: 'A' });
            await repo.create({ name: 'B' });
            await repo.deleteAll();
            expect(await repo.findAll()).toEqual([]);
        });
    });
});
