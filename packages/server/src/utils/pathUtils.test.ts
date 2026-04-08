import { describe, expect, it } from 'bun:test';
import { extractPathParam } from './pathUtils';

describe('extractPathParam', () => {
    it('extracts a single path param', () => {
        expect(extractPathParam('http://localhost/api/tasks/abc123', '/api/tasks/:id')).toBe(
            'abc123',
        );
    });

    it('extracts param from URL with query string', () => {
        expect(
            extractPathParam('http://localhost/api/tasks/abc123?foo=bar', '/api/tasks/:id'),
        ).toBe('abc123');
    });

    it('extracts param from relative URL path', () => {
        expect(extractPathParam('/api/tasks/abc123', '/api/tasks/:id')).toBe('abc123');
    });

    it('returns null when URL does not match pattern', () => {
        expect(extractPathParam('http://localhost/api/tasks', '/api/tasks/:id')).toBeNull();
    });

    it('returns null for completely different path', () => {
        expect(extractPathParam('http://localhost/api/projects/xyz', '/api/tasks/:id')).toBeNull();
    });

    it('extracts param from multi-segment pattern', () => {
        expect(
            extractPathParam(
                'http://localhost/api/recurring-tasks/rt-1/generate',
                '/api/recurring-tasks/:id/generate',
            ),
        ).toBe('rt-1');
    });

    it('extracts param from activate pattern', () => {
        expect(
            extractPathParam(
                'http://localhost/api/projects/proj-42/activate',
                '/api/projects/:id/activate',
            ),
        ).toBe('proj-42');
    });

    it('handles UUID-style IDs', () => {
        const id = '550e8400-e29b-41d4-a716-446655440000';
        expect(extractPathParam(`http://localhost/api/tasks/${id}`, '/api/tasks/:id')).toBe(id);
    });
});
