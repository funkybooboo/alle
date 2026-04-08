/**
 * Rate limiting middleware — token-bucket algorithm
 *
 * One bucket per client IP. Configurable via RATE_LIMIT_RPM environment variable.
 * In-memory storage; suitable for single-user mode.
 */

import type { Guard } from '../adapters/http/types';

interface Bucket {
    tokens: number;
    lastRefill: number;
}

/**
 * Create a token-bucket rate limiter guard.
 * Runs BEFORE the route handler — rejected requests never reach the handler.
 *
 * @param requestsPerMinute - Max requests per minute per IP (default: 60)
 */
export function createRateLimiterGuard(requestsPerMinute: number = 60): Guard {
    const buckets = new Map<string, Bucket>();
    const refillIntervalMs = 60_000 / requestsPerMinute;

    function getIp(headers: Record<string, string>): string {
        return headers['x-forwarded-for'] ?? headers['x-real-ip'] ?? '::1';
    }

    function refillBucket(bucket: Bucket, now: number): void {
        const elapsed = now - bucket.lastRefill;
        const tokensToAdd = Math.floor(elapsed / refillIntervalMs);
        if (tokensToAdd > 0) {
            bucket.tokens = Math.min(requestsPerMinute, bucket.tokens + tokensToAdd);
            bucket.lastRefill = now;
        }
    }

    return req => {
        const ip = getIp(req.headers);
        const now = Date.now();

        let bucket = buckets.get(ip);
        if (!bucket) {
            bucket = { tokens: requestsPerMinute, lastRefill: now };
            buckets.set(ip, bucket);
        }

        refillBucket(bucket, now);

        if (bucket.tokens <= 0) {
            return {
                status: 429,
                headers: {},
                body: {
                    error: 'Rate limit exceeded',
                    code: 'RATE_LIMIT_EXCEEDED',
                },
            };
        }

        bucket.tokens -= 1;
        return null;
    };
}
