import { describe, expect, it } from 'bun:test';
import type { HttpRequest, HttpResponse } from '../adapters/http/types';
import { createSecurityHeadersMiddleware } from './securityHeaders';

function makeRequest(headers: Record<string, string> = {}): HttpRequest {
    return {
        method: 'GET',
        url: 'http://localhost/',
        headers,
        json: <T>() => Promise.resolve({} as T),
        text: async () => '',
    };
}

function makeResponse(headers: Record<string, string> = {}): HttpResponse {
    return { status: 200, headers, body: { data: 'ok' } };
}

describe('createSecurityHeadersMiddleware', () => {
    it('adds X-Content-Type-Options: nosniff', () => {
        const middleware = createSecurityHeadersMiddleware('development');
        const result = middleware(makeRequest(), makeResponse());
        expect(result.headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('adds X-Frame-Options: DENY', () => {
        const middleware = createSecurityHeadersMiddleware('development');
        const result = middleware(makeRequest(), makeResponse());
        expect(result.headers['X-Frame-Options']).toBe('DENY');
    });

    it('adds Content-Security-Policy header', () => {
        const middleware = createSecurityHeadersMiddleware('development');
        const result = middleware(makeRequest(), makeResponse());
        expect(result.headers['Content-Security-Policy']).toContain("default-src 'none'");
    });

    it('does NOT add HSTS header in development', () => {
        const middleware = createSecurityHeadersMiddleware('development');
        const result = middleware(makeRequest(), makeResponse());
        expect(result.headers['Strict-Transport-Security']).toBeUndefined();
    });

    it('adds HSTS header in production', () => {
        const middleware = createSecurityHeadersMiddleware('production');
        const result = middleware(makeRequest(), makeResponse());
        expect(result.headers['Strict-Transport-Security']).toBe(
            'max-age=63072000; includeSubDomains',
        );
    });

    it('preserves existing response headers', () => {
        const middleware = createSecurityHeadersMiddleware('development');
        const res = makeResponse({ 'Content-Type': 'application/json' });
        const result = middleware(makeRequest(), res);
        expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('preserves response status and body', () => {
        const middleware = createSecurityHeadersMiddleware('development');
        const res = makeResponse();
        const result = middleware(makeRequest(), res);
        expect(result.status).toBe(200);
        expect(result.body).toEqual({ data: 'ok' });
    });
});
