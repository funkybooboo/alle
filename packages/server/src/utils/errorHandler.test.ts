import { describe, expect, it } from 'bun:test';
import {
    AppError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from '@alle/shared';
import { errorToResponse } from './errorHandler';

describe('errorToResponse', () => {
    it('maps ValidationError to 400 with VALIDATION_ERROR code', () => {
        const err = new ValidationError('name is required');
        const res = errorToResponse(err);
        expect(res.status).toBe(400);
        expect((res.body as { code: string }).code).toBe('VALIDATION_ERROR');
        expect((res.body as { error: string }).error).toBe('name is required');
    });

    it('includes details when ValidationError has data', () => {
        const err = new ValidationError('invalid', { fields: { name: ['too short'] } });
        const res = errorToResponse(err);
        expect((res.body as { details: unknown }).details).toEqual({
            fields: { name: ['too short'] },
        });
    });

    it('maps NotFoundError to 404 with NOT_FOUND code', () => {
        const err = new NotFoundError('Task not found');
        const res = errorToResponse(err);
        expect(res.status).toBe(404);
        expect((res.body as { code: string }).code).toBe('NOT_FOUND');
    });

    it('maps BadRequestError to 400 with BAD_REQUEST code', () => {
        const err = new BadRequestError('Bad input');
        const res = errorToResponse(err);
        expect(res.status).toBe(400);
        expect((res.body as { code: string }).code).toBe('BAD_REQUEST');
    });

    it('maps UnauthorizedError to 401 with UNAUTHORIZED code', () => {
        const err = new UnauthorizedError();
        const res = errorToResponse(err);
        expect(res.status).toBe(401);
        expect((res.body as { code: string }).code).toBe('UNAUTHORIZED');
    });

    it('maps ForbiddenError to 403 with FORBIDDEN code', () => {
        const err = new ForbiddenError();
        const res = errorToResponse(err);
        expect(res.status).toBe(403);
        expect((res.body as { code: string }).code).toBe('FORBIDDEN');
    });

    it('maps ConflictError to 409 with CONFLICT code', () => {
        const err = new ConflictError('Already exists');
        const res = errorToResponse(err);
        expect(res.status).toBe(409);
        expect((res.body as { code: string }).code).toBe('CONFLICT');
    });

    it('maps generic AppError using its statusCode and code', () => {
        const err = new AppError('custom', 418, true, undefined, 'CUSTOM_CODE');
        const res = errorToResponse(err);
        expect(res.status).toBe(418);
        expect((res.body as { code: string }).code).toBe('CUSTOM_CODE');
    });

    it('maps unknown errors to 500 with INTERNAL_SERVER_ERROR', () => {
        const res = errorToResponse(new Error('boom'));
        expect(res.status).toBe(500);
        expect((res.body as { code: string }).code).toBe('INTERNAL_SERVER_ERROR');
        expect((res.body as { error: string }).error).toBe('Internal server error');
    });

    it('maps non-Error unknowns to 500', () => {
        const res = errorToResponse('something went wrong');
        expect(res.status).toBe(500);
        expect((res.body as { code: string }).code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('does not include details when error has no data', () => {
        const err = new NotFoundError('not found');
        const res = errorToResponse(err);
        expect((res.body as Record<string, unknown>)['details']).toBeUndefined();
    });
});
