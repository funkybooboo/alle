import { describe, expect, test } from 'bun:test';
import { isValidTimeRange, isValidTimeString } from './task';

describe('isValidTimeString', () => {
    test('null is valid (all-day task)', () => {
        expect(isValidTimeString(null)).toBe(true);
    });

    test('valid times', () => {
        expect(isValidTimeString('00:00')).toBe(true);
        expect(isValidTimeString('09:00')).toBe(true);
        expect(isValidTimeString('23:59')).toBe(true);
        expect(isValidTimeString('12:30')).toBe(true);
    });

    test('invalid: out of range hours', () => {
        expect(isValidTimeString('24:00')).toBe(false);
        expect(isValidTimeString('99:00')).toBe(false);
    });

    test('invalid: out of range minutes', () => {
        expect(isValidTimeString('12:60')).toBe(false);
        expect(isValidTimeString('12:99')).toBe(false);
    });

    test('invalid: not zero-padded', () => {
        expect(isValidTimeString('9:00')).toBe(false);
        expect(isValidTimeString('9:5')).toBe(false);
    });

    test('invalid: non-time strings', () => {
        expect(isValidTimeString('abc')).toBe(false);
        expect(isValidTimeString('')).toBe(false);
        expect(isValidTimeString('12:3a')).toBe(false);
    });
});

describe('isValidTimeRange', () => {
    test('both null is valid (all-day task)', () => {
        expect(isValidTimeRange(null, null)).toBe(true);
    });

    test('one null is valid (open-ended or all-day)', () => {
        expect(isValidTimeRange('09:00', null)).toBe(true);
        expect(isValidTimeRange(null, '10:00')).toBe(true);
    });

    test('end after start is valid', () => {
        expect(isValidTimeRange('09:00', '10:00')).toBe(true);
        expect(isValidTimeRange('09:00', '09:01')).toBe(true);
        expect(isValidTimeRange('00:00', '23:59')).toBe(true);
    });

    test('same time is valid (instant)', () => {
        expect(isValidTimeRange('09:00', '09:00')).toBe(true);
    });

    test('end before start is invalid', () => {
        expect(isValidTimeRange('10:00', '09:00')).toBe(false);
        expect(isValidTimeRange('23:59', '00:00')).toBe(false);
    });
});
