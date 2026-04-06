import { describe, expect, test } from 'bun:test';
import { NativeDateProvider } from '@alle/shared';
import { InMemorySomeDayGroupRepository } from './InMemorySomeDayGroupRepository';

function makeRepo() {
    return new InMemorySomeDayGroupRepository(new NativeDateProvider());
}

describe('InMemorySomeDayGroupRepository', () => {
    describe('create', () => {
        test('creates a group with generated id and createdAt', async () => {
            const repo = makeRepo();
            const group = await repo.create({ name: 'Work', tag: '#work', position: 0 });
            expect(group.id).toBeDefined();
            expect(group.createdAt).toBeDefined();
            expect(group.name).toBe('Work');
            expect(group.tag).toBe('#work');
            expect(group.position).toBe(0);
            expect(group.description).toBeNull();
        });

        test('creates a group with optional description', async () => {
            const repo = makeRepo();
            const group = await repo.create({
                name: 'Personal',
                tag: '#personal',
                position: 1,
                description: 'Personal projects',
            });
            expect(group.description).toBe('Personal projects');
        });

        test('assigns sequential ids', async () => {
            const repo = makeRepo();
            const a = await repo.create({ name: 'A', tag: '#a', position: 0 });
            const b = await repo.create({ name: 'B', tag: '#b', position: 1 });
            expect(a.id).not.toBe(b.id);
        });
    });

    describe('findAll', () => {
        test('returns empty array when no groups exist', async () => {
            const repo = makeRepo();
            expect(await repo.findAll()).toEqual([]);
        });

        test('returns groups sorted by position', async () => {
            const repo = makeRepo();
            await repo.create({ name: 'C', tag: '#c', position: 2 });
            await repo.create({ name: 'A', tag: '#a', position: 0 });
            await repo.create({ name: 'B', tag: '#b', position: 1 });
            const groups = await repo.findAll();
            expect(groups.map(g => g.name)).toEqual(['A', 'B', 'C']);
        });
    });

    describe('findById', () => {
        test('returns null for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.findById('nope')).toBeNull();
        });

        test('returns the group when found', async () => {
            const repo = makeRepo();
            const created = await repo.create({ name: 'Work', tag: '#work', position: 0 });
            const found = await repo.findById(created.id);
            expect(found).toEqual(created);
        });
    });

    describe('update', () => {
        test('returns null for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.update('nope', { name: 'New' })).toBeNull();
        });

        test('updates only provided fields', async () => {
            const repo = makeRepo();
            const created = await repo.create({ name: 'Work', tag: '#work', position: 0 });
            const updated = await repo.update(created.id, { name: 'Updated Work' });
            expect(updated?.name).toBe('Updated Work');
            expect(updated?.tag).toBe('#work');
            expect(updated?.position).toBe(0);
        });
    });

    describe('delete', () => {
        test('returns false for unknown id', async () => {
            const repo = makeRepo();
            expect(await repo.delete('nope')).toBe(false);
        });

        test('returns true and removes the group', async () => {
            const repo = makeRepo();
            const group = await repo.create({ name: 'Work', tag: '#work', position: 0 });
            expect(await repo.delete(group.id)).toBe(true);
            expect(await repo.findById(group.id)).toBeNull();
        });
    });

    describe('deleteAll', () => {
        test('empties the store', async () => {
            const repo = makeRepo();
            await repo.create({ name: 'A', tag: '#a', position: 0 });
            await repo.create({ name: 'B', tag: '#b', position: 1 });
            await repo.deleteAll();
            expect(await repo.findAll()).toEqual([]);
        });
    });
});
