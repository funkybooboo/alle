import { describe, expect, test } from 'bun:test';
import type {
    CreateSomeDayGroupInput,
    SomeDayGroup,
    UpdateSomeDayGroupInput,
} from './someDayGroup';

describe('SomeDayGroup types', () => {
    test('SomeDayGroup has all required fields', () => {
        const group: SomeDayGroup = {
            id: '1',
            name: 'Work',
            description: null,
            tag: '#work',
            position: 0,
            createdAt: '2026-04-06T00:00:00.000Z',
        };
        expect(group.id).toBe('1');
        expect(group.name).toBe('Work');
        expect(group.description).toBeNull();
        expect(group.tag).toBe('#work');
        expect(group.position).toBe(0);
        expect(group.createdAt).toBeDefined();
    });

    test('CreateSomeDayGroupInput requires name, tag, position', () => {
        const input: CreateSomeDayGroupInput = { name: 'Personal', tag: '#personal', position: 1 };
        expect(input.name).toBe('Personal');
        expect(input.tag).toBe('#personal');
        expect(input.position).toBe(1);
    });

    test('CreateSomeDayGroupInput supports optional description', () => {
        const input: CreateSomeDayGroupInput = {
            name: 'Work',
            tag: '#work',
            position: 0,
            description: 'Work tasks',
        };
        expect(input.description).toBe('Work tasks');
    });

    test('UpdateSomeDayGroupInput is fully optional', () => {
        const input: UpdateSomeDayGroupInput = { name: 'Updated' };
        expect(input.name).toBe('Updated');
        expect(input.description).toBeUndefined();
        expect(input.tag).toBeUndefined();
        expect(input.position).toBeUndefined();
    });
});
