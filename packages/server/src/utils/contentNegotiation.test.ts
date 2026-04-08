import { describe, expect, it } from 'bun:test';
import { negotiate } from './contentNegotiation';

describe('negotiate', () => {
    it('returns json when accept is undefined', () => {
        expect(negotiate(undefined)).toBe('json');
    });

    it('returns json for application/json', () => {
        expect(negotiate('application/json')).toBe('json');
    });

    it('returns json for */* (browser/Bruno default)', () => {
        expect(negotiate('*/*')).toBe('json');
    });

    it('returns json for absent accept header (empty string)', () => {
        expect(negotiate('')).toBe('json');
    });

    it('returns text for text/plain', () => {
        expect(negotiate('text/plain')).toBe('text');
    });

    it('returns text when text/plain appears in a multi-value accept header', () => {
        expect(negotiate('text/plain, application/json')).toBe('text');
    });

    it('returns text for text/plain; charset=utf-8', () => {
        expect(negotiate('text/plain; charset=utf-8')).toBe('text');
    });
});
