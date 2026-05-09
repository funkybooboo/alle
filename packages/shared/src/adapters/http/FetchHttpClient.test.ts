import { describe, expect, it } from 'bun:test';
import { FetchHttpClient } from './FetchHttpClient';
import { HttpClientError } from './HttpClient';

describe('FetchHttpClient', () => {
    const baseUrl = 'http://localhost:9999';

    describe('constructor', () => {
        it('creates instance with default empty baseUrl', () => {
            const client = new FetchHttpClient();
            expect(client).toBeInstanceOf(FetchHttpClient);
        });

        it('creates instance with custom baseUrl', () => {
            const client = new FetchHttpClient(baseUrl);
            expect(client).toBeInstanceOf(FetchHttpClient);
        });
    });

    describe('error handling', () => {
        it('HttpClientError has correct properties', () => {
            const err = new HttpClientError(404, 'Not Found', '{"error":"missing"}');
            expect(err.statusCode).toBe(404);
            expect(err.statusText).toBe('Not Found');
            expect(err.body).toBe('{"error":"missing"}');
            expect(err.message).toBe('HTTP Error 404: Not Found');
            expect(err.name).toBe('HttpClientError');
            expect(err).toBeInstanceOf(Error);
        });

        it('HttpClientError works without body', () => {
            const err = new HttpClientError(500, 'Internal Server Error');
            expect(err.statusCode).toBe(500);
            expect(err.body).toBeUndefined();
        });
    });
});
