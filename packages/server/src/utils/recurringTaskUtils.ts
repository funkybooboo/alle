/**
 * Recurring task utilities
 *
 * Pure functions for generating task occurrence dates from a RecurringTask template.
 * No I/O — fully unit testable.
 */

import type { RecurringTask } from '@alle/shared';

/**
 * Generate occurrence dates for a recurring task within a date range (inclusive).
 *
 * @param rt - The recurring task template
 * @param startDate - Range start, ISO 8601 YYYY-MM-DD
 * @param endDate - Range end, ISO 8601 YYYY-MM-DD
 * @returns Array of ISO 8601 date strings for each occurrence
 */
export function generateOccurrences(
    rt: RecurringTask,
    startDate: string,
    endDate: string,
): string[] {
    // Parse YYYY-MM-DD as a local-midnight Date so local getters (getFullYear/
    // getMonth/getDate) return the same calendar day in every timezone. Using
    // `new Date('YYYY-MM-DD')` instead parses as UTC midnight, which shifts the
    // day back by one in negative-offset zones (the occurrence dates came back
    // a day early through the HTTP API when the server ran in UTC-6).
    const start = parseLocal(startDate);
    const end = parseLocal(endDate);
    const templateStart = parseLocal(rt.startDate);
    const templateEnd = rt.endDate ? parseLocal(rt.endDate) : null;

    const results: string[] = [];

    // Clamp effective range to the template's own start/end dates
    const effectiveStart = start > templateStart ? start : templateStart;
    const effectiveEnd = templateEnd && end > templateEnd ? templateEnd : end;

    if (effectiveStart > effectiveEnd) return [];

    const interval = rt.interval > 0 ? rt.interval : 1;
    let cursor = new Date(effectiveStart);

    // Advance cursor to the first valid occurrence on or after effectiveStart
    cursor = advanceToFirstOccurrence(rt, cursor, templateStart, interval);

    while (cursor <= effectiveEnd) {
        results.push(toIsoDate(cursor));
        cursor = nextOccurrence(rt, cursor, interval);
    }

    return results;
}

/**
 * Advance the cursor to the first occurrence on or after `from`,
 * respecting the template's frequency and interval.
 */
function advanceToFirstOccurrence(
    rt: RecurringTask,
    from: Date,
    templateStart: Date,
    interval: number,
): Date {
    let cursor = new Date(templateStart);

    while (cursor < from) {
        cursor = nextOccurrence(rt, cursor, interval);
    }

    return cursor;
}

/**
 * Calculate the next occurrence after the given date.
 */
function nextOccurrence(rt: RecurringTask, current: Date, interval: number): Date {
    const next = new Date(current);

    switch (rt.frequency) {
        case 'daily':
            next.setDate(next.getDate() + interval);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7 * interval);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + interval);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + interval);
            break;
    }

    return next;
}

/**
 * Parse a `YYYY-MM-DD` string as a Date at local midnight (not UTC midnight),
 * so local getters return the same calendar day regardless of zone.
 */
function parseLocal(iso: string): Date {
    const parts = iso.split('-').map(Number);
    const y = parts[0] ?? 1970;
    const m = parts[1] ?? 1;
    const d = parts[2] ?? 1;
    return new Date(y, m - 1, d);
}

/**
 * Format a Date as YYYY-MM-DD without timezone conversion.
 */
function toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
