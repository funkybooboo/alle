import { describe, expect, test } from 'bun:test';
import type { CreateProjectInput, Project, UpdateProjectInput } from './project';

describe('Project types', () => {
    test('Project has all required fields', () => {
        const project: Project = {
            id: '1',
            name: 'My Project',
            description: null,
            startDate: null,
            dueDate: null,
            isActive: true,
            createdAt: '2026-04-06T00:00:00.000Z',
            completedAt: null,
        };
        expect(project.id).toBe('1');
        expect(project.name).toBe('My Project');
        expect(project.isActive).toBe(true);
        expect(project.completedAt).toBeNull();
    });

    test('CreateProjectInput requires only name', () => {
        const input: CreateProjectInput = { name: 'Simple Project' };
        expect(input.name).toBe('Simple Project');
    });

    test('CreateProjectInput supports optional fields', () => {
        const input: CreateProjectInput = {
            name: 'Full Project',
            description: 'A detailed project',
            startDate: '2026-04-01',
            dueDate: '2026-04-30',
        };
        expect(input.description).toBe('A detailed project');
        expect(input.startDate).toBe('2026-04-01');
        expect(input.dueDate).toBe('2026-04-30');
    });

    test('UpdateProjectInput is fully optional', () => {
        const input: UpdateProjectInput = {
            isActive: false,
            completedAt: '2026-04-06T00:00:00.000Z',
        };
        expect(input.isActive).toBe(false);
        expect(input.name).toBeUndefined();
    });
});
