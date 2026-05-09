import { describe, expect, it } from 'bun:test';
import { isValidTimeRange, isValidTimeString } from './task';

describe('isValidTimeString', () => {
    it('returns true for null (all-day)', () => {
        expect(isValidTimeString(null)).toBe(true);
    });

    it('returns true for valid times', () => {
        expect(isValidTimeString('00:00')).toBe(true);
        expect(isValidTimeString('12:30')).toBe(true);
        expect(isValidTimeString('23:59')).toBe(true);
        expect(isValidTimeString('09:05')).toBe(true);
    });

    it('returns false for invalid times', () => {
        expect(isValidTimeString('24:00')).toBe(false);
        expect(isValidTimeString('12:60')).toBe(false);
        expect(isValidTimeString('99:99')).toBe(false);
    });

    it('returns false for wrong format', () => {
        expect(isValidTimeString('9:30')).toBe(false);
        expect(isValidTimeString('123:00')).toBe(false);
        expect(isValidTimeString('12:00:00')).toBe(false);
        expect(isValidTimeString('')).toBe(false);
        expect(isValidTimeString('abc')).toBe(false);
    });
});

describe('isValidTimeRange', () => {
    it('returns true when either value is null', () => {
        expect(isValidTimeRange(null, '10:00')).toBe(true);
        expect(isValidTimeRange('10:00', null)).toBe(true);
        expect(isValidTimeRange(null, null)).toBe(true);
    });

    it('returns true when end >= start', () => {
        expect(isValidTimeRange('09:00', '17:00')).toBe(true);
        expect(isValidTimeRange('09:00', '09:00')).toBe(true);
        expect(isValidTimeRange('00:00', '23:59')).toBe(true);
    });

    it('returns false when end < start', () => {
        expect(isValidTimeRange('17:00', '09:00')).toBe(false);
        expect(isValidTimeRange('23:59', '00:00')).toBe(false);
    });
});
