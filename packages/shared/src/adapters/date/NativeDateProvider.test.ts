import { beforeEach, describe, expect, it } from 'bun:test';
import { NativeDateProvider } from './NativeDateProvider';

describe('NativeDateProvider', () => {
    let provider: NativeDateProvider;

    beforeEach(() => {
        provider = new NativeDateProvider();
    });

    describe('today', () => {
        it('returns date in YYYY-MM-DD format', () => {
            const result = provider.today();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('tomorrow', () => {
        it('returns a date one day after today', () => {
            const today = provider.today();
            const tomorrow = provider.tomorrow();
            expect(provider.daysBetween(today, tomorrow)).toBe(1);
        });
    });

    describe('yesterday', () => {
        it('returns a date one day before today', () => {
            const today = provider.today();
            const yesterday = provider.yesterday();
            expect(provider.daysBetween(yesterday, today)).toBe(1);
        });
    });

    describe('addDays', () => {
        it('adds positive days', () => {
            const result = provider.addDays('2026-01-01', 5);
            expect(result).toBe('2026-01-06');
        });

        it('adds negative days', () => {
            const result = provider.addDays('2026-01-10', -3);
            expect(result).toBe('2026-01-07');
        });

        it('handles month boundaries', () => {
            const result = provider.addDays('2026-01-30', 3);
            expect(result).toBe('2026-02-02');
        });

        it('handles year boundaries', () => {
            const result = provider.addDays('2025-12-30', 3);
            expect(result).toBe('2026-01-02');
        });
    });

    describe('startOfWeek', () => {
        it('returns Monday for a Wednesday', () => {
            // 2026-01-07 is a Wednesday
            const result = provider.startOfWeek('2026-01-07');
            expect(result).toBe('2026-01-05');
        });

        it('returns Monday for a Sunday', () => {
            // 2026-01-04 is a Sunday
            const result = provider.startOfWeek('2026-01-04');
            expect(result).toBe('2025-12-29');
        });

        it('returns same day if already Monday', () => {
            // 2026-01-05 is a Monday
            const result = provider.startOfWeek('2026-01-05');
            expect(result).toBe('2026-01-05');
        });
    });

    describe('endOfWeek', () => {
        it('returns Sunday for a Wednesday', () => {
            // 2026-01-07 is a Wednesday
            const result = provider.endOfWeek('2026-01-07');
            expect(result).toBe('2026-01-11');
        });

        it('returns same day if already Sunday', () => {
            // 2026-01-04 is a Sunday
            const result = provider.endOfWeek('2026-01-04');
            expect(result).toBe('2026-01-04');
        });
    });

    describe('currentWeekDates', () => {
        it('returns 7 dates starting from Monday', () => {
            const dates = provider.currentWeekDates();
            expect(dates).toHaveLength(7);
            const first = dates[0];
            const last = dates[6];
            expect(first).toBe(provider.startOfWeek(provider.today()));
            expect(last).toBe(provider.endOfWeek(provider.today()));
        });

        it('each date is one day after the previous', () => {
            const dates = provider.currentWeekDates();
            for (let i = 1; i < dates.length; i++) {
                const prev = dates[i - 1];
                const curr = dates[i];
                expect(prev).toBeDefined();
                expect(curr).toBeDefined();
                expect(provider.daysBetween(prev as string, curr as string)).toBe(1);
            }
        });
    });

    describe('formatDate', () => {
        it('formats short date', () => {
            const result = provider.formatDate('2026-01-15', 'short');
            expect(result).toBe('Jan 15, 2026');
        });

        it('formats long date', () => {
            const result = provider.formatDate('2026-01-15', 'long');
            expect(result).toBe('January 15, 2026');
        });

        it('formats weekday', () => {
            const result = provider.formatDate('2026-01-15', 'weekday');
            expect(result).toBe('Thursday');
        });
    });

    describe('isToday', () => {
        it('returns true for today', () => {
            expect(provider.isToday(provider.today())).toBe(true);
        });

        it('returns false for other dates', () => {
            expect(provider.isToday('2000-01-01')).toBe(false);
        });
    });

    describe('isPast', () => {
        it('returns true for dates before today', () => {
            expect(provider.isPast('2000-01-01')).toBe(true);
        });

        it('returns false for today', () => {
            expect(provider.isPast(provider.today())).toBe(false);
        });

        it('returns false for future dates', () => {
            expect(provider.isPast(provider.addDays(provider.today(), 30))).toBe(false);
        });
    });

    describe('isFuture', () => {
        it('returns true for dates after today', () => {
            expect(provider.isFuture('2099-01-01')).toBe(true);
        });

        it('returns false for today', () => {
            expect(provider.isFuture(provider.today())).toBe(false);
        });

        it('returns false for past dates', () => {
            expect(provider.isFuture('2000-01-01')).toBe(false);
        });
    });

    describe('timestamp', () => {
        it('returns ISO 8601 format', () => {
            const ts = provider.timestamp();
            expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
    });

    describe('dateFromTimestamp', () => {
        it('extracts date portion', () => {
            // Returns the LOCAL calendar day of the instant; cannot assert a
            // fixed YYYY-MM-DD across host timezones. Just check the format.
            const result = provider.dateFromTimestamp('2026-05-09T14:30:00.000Z');
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('daysBetween', () => {
        it('returns positive when second date is later', () => {
            expect(provider.daysBetween('2026-01-01', '2026-01-05')).toBe(4);
        });

        it('returns negative when second date is earlier', () => {
            expect(provider.daysBetween('2026-01-05', '2026-01-01')).toBe(-4);
        });

        it('returns 0 for same date', () => {
            expect(provider.daysBetween('2026-01-01', '2026-01-01')).toBe(0);
        });
    });

    describe('isValidDate', () => {
        it('returns true for valid dates', () => {
            expect(provider.isValidDate('2026-01-15')).toBe(true);
            expect(provider.isValidDate('2026-12-31')).toBe(true);
        });

        it('returns false for invalid dates', () => {
            expect(provider.isValidDate('2026-13-01')).toBe(false);
            expect(provider.isValidDate('2026-00-01')).toBe(false);
        });

        it('returns false for wrong format', () => {
            expect(provider.isValidDate('not-a-date')).toBe(false);
            expect(provider.isValidDate('26-1-1')).toBe(false);
            expect(provider.isValidDate('')).toBe(false);
        });
    });
});
