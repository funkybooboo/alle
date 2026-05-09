import { describe, expect, it } from 'bun:test';
import {
    AppError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from './AppError';

describe('AppError', () => {
    it('sets message and default properties', () => {
        const err = new AppError('something broke');
        expect(err.message).toBe('something broke');
        expect(err.statusCode).toBe(500);
        expect(err.isOperational).toBe(true);
        expect(err.code).toBe('INTERNAL_SERVER_ERROR');
        expect(err.data).toBeUndefined();
        expect(err.name).toBe('AppError');
    });

    it('accepts custom statusCode, isOperational, data, code', () => {
        const err = new AppError('custom', 418, false, { foo: 'bar' }, 'TEAPOT');
        expect(err.statusCode).toBe(418);
        expect(err.isOperational).toBe(false);
        expect(err.data).toEqual({ foo: 'bar' });
        expect(err.code).toBe('TEAPOT');
    });

    it('toJSON returns correct shape', () => {
        const err = new AppError('msg', 400, true, { detail: 'x' }, 'CODE');
        const json = err.toJSON();
        expect(json).toEqual({
            name: 'AppError',
            message: 'msg',
            statusCode: 400,
            data: { detail: 'x' },
        });
    });

    it('is instance of Error', () => {
        expect(new AppError('x')).toBeInstanceOf(Error);
    });
});

describe('ValidationError', () => {
    it('sets statusCode 400 and code VALIDATION_ERROR', () => {
        const err = new ValidationError('bad input');
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.isOperational).toBe(true);
        expect(err.name).toBe('ValidationError');
    });

    it('accepts optional data', () => {
        const err = new ValidationError('bad', { fields: { name: 'required' } });
        expect(err.data).toEqual({ fields: { name: 'required' } });
    });
});

describe('NotFoundError', () => {
    it('sets statusCode 404 and code NOT_FOUND', () => {
        const err = new NotFoundError();
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('NOT_FOUND');
        expect(err.message).toBe('Resource not found');
    });

    it('accepts custom message', () => {
        const err = new NotFoundError('Task not found');
        expect(err.message).toBe('Task not found');
    });
});

describe('UnauthorizedError', () => {
    it('sets statusCode 401 and code UNAUTHORIZED', () => {
        const err = new UnauthorizedError();
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('UNAUTHORIZED');
        expect(err.message).toBe('Authentication required');
    });
});

describe('ForbiddenError', () => {
    it('sets statusCode 403 and code FORBIDDEN', () => {
        const err = new ForbiddenError();
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('FORBIDDEN');
        expect(err.message).toBe('Permission denied');
    });
});

describe('ConflictError', () => {
    it('sets statusCode 409 and code CONFLICT', () => {
        const err = new ConflictError('duplicate');
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('CONFLICT');
    });
});

describe('BadRequestError', () => {
    it('sets statusCode 400 and code BAD_REQUEST', () => {
        const err = new BadRequestError('malformed');
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('BAD_REQUEST');
    });
});

describe('InternalServerError', () => {
    it('sets statusCode 500, isOperational false, code INTERNAL_SERVER_ERROR', () => {
        const err = new InternalServerError();
        expect(err.statusCode).toBe(500);
        expect(err.isOperational).toBe(false);
        expect(err.code).toBe('INTERNAL_SERVER_ERROR');
        expect(err.message).toBe('Internal server error');
    });
});
