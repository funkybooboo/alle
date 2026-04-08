import { describe, expect, it } from 'bun:test';
import { ValidationError } from '@alle/shared';
import { z } from 'zod';
import { parseBody, parseQuery } from './validate';

const NameSchema = z.object({
    name: z.string().min(1),
    age: z.number().int().min(0).optional(),
});

describe('parseBody', () => {
    it('returns parsed data for valid input', () => {
        const result = parseBody(NameSchema, { name: 'Alice', age: 30 });
        expect(result).toEqual({ name: 'Alice', age: 30 });
    });

    it('strips unknown keys', () => {
        const result = parseBody(NameSchema, { name: 'Alice', extra: 'ignored' });
        expect(result).toEqual({ name: 'Alice' });
    });

    it('throws ValidationError for invalid input', () => {
        expect(() => parseBody(NameSchema, { name: '' })).toThrow(ValidationError);
    });

    it('thrown ValidationError has code VALIDATION_ERROR', () => {
        let caught: unknown;
        try {
            parseBody(NameSchema, { name: '' });
        } catch (e) {
            caught = e;
        }
        expect(caught).toBeInstanceOf(ValidationError);
        expect((caught as ValidationError).code).toBe('VALIDATION_ERROR');
    });

    it('thrown ValidationError includes field-level details', () => {
        let caught: unknown;
        try {
            parseBody(NameSchema, { name: '' });
        } catch (e) {
            caught = e;
        }
        const err = caught as ValidationError;
        expect(err.data).toBeDefined();
        expect((err.data as { fields: Record<string, unknown> }).fields).toHaveProperty('name');
    });

    it('throws ValidationError when required field is missing', () => {
        expect(() => parseBody(NameSchema, {})).toThrow(ValidationError);
    });

    it('throws ValidationError for non-object input', () => {
        expect(() => parseBody(NameSchema, 'not-an-object')).toThrow(ValidationError);
    });
});

describe('parseQuery', () => {
    it('parses query params from URL', () => {
        const Schema = z.object({ page: z.string().optional() });
        const result = parseQuery(Schema, 'http://localhost/api/tasks?page=2');
        expect(result).toEqual({ page: '2' });
    });

    it('returns empty object when no query params', () => {
        const Schema = z.object({ page: z.string().optional() });
        const result = parseQuery(Schema, 'http://localhost/api/tasks');
        expect(result).toEqual({});
    });

    it('throws ValidationError for invalid query params', () => {
        const Schema = z.object({ count: z.enum(['1', '2', '3']) });
        expect(() => parseQuery(Schema, 'http://localhost/api/tasks?count=99')).toThrow(
            ValidationError,
        );
    });

    it('works with relative URL paths', () => {
        const Schema = z.object({ tag: z.string().optional() });
        const result = parseQuery(Schema, '/api/tasks?tag=work');
        expect(result).toEqual({ tag: 'work' });
    });
});
