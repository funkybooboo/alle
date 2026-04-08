import { describe, expect, it } from 'bun:test';
import type { HttpRequest } from '../adapters/http/types';
import { createRateLimiterGuard } from './rateLimiter';

function makeRequest(ip?: string): HttpRequest {
    const headers: Record<string, string> = {};
    if (ip) headers['x-forwarded-for'] = ip;
    return {
        method: 'GET',
        url: 'http://localhost/api/tasks',
        headers,
        json: <T>() => Promise.resolve({} as T),
        text: async () => '',
    };
}

describe('createRateLimiterGuard', () => {
    it('passes through requests under the limit (returns null)', () => {
        const guard = createRateLimiterGuard(10);
        const result = guard(makeRequest('1.2.3.4'));
        expect(result).toBeNull();
    });

    it('returns 429 after exceeding the limit', () => {
        const rpm = 3;
        const guard = createRateLimiterGuard(rpm);
        const req = makeRequest('10.0.0.1');

        // Exhaust all tokens
        for (let i = 0; i < rpm; i++) {
            guard(req);
        }
        // Next request should be rate limited
        const result = guard(req);
        expect(result).not.toBeNull();
        expect(result?.status).toBe(429);
        expect((result?.body as { code: string }).code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('returns RATE_LIMIT_EXCEEDED error body', () => {
        const guard = createRateLimiterGuard(1);
        const req = makeRequest('10.0.0.2');
        guard(req); // exhaust
        const result = guard(req);
        expect((result?.body as { error: string }).error).toBe('Rate limit exceeded');
    });

    it('uses separate buckets per IP', () => {
        const guard = createRateLimiterGuard(1);

        // Exhaust IP A
        guard(makeRequest('192.168.1.1'));
        const limitedA = guard(makeRequest('192.168.1.1'));
        expect(limitedA?.status).toBe(429);

        // IP B should still have tokens
        const okB = guard(makeRequest('192.168.1.2'));
        expect(okB).toBeNull();
    });

    it('reads IP from x-forwarded-for header', () => {
        const guard = createRateLimiterGuard(1);
        const req: HttpRequest = {
            method: 'GET',
            url: 'http://localhost/',
            headers: { 'x-forwarded-for': '203.0.113.5' },
            json: <T>() => Promise.resolve({} as T),
            text: async () => '',
        };
        guard(req); // exhaust
        const result = guard(req);
        expect(result?.status).toBe(429);
    });

    it('falls back to ::1 when no IP header present', () => {
        const guard = createRateLimiterGuard(1);
        const req = makeRequest(); // no IP header
        guard(req); // exhaust ::1
        const result = guard(req);
        expect(result?.status).toBe(429);
    });
});
