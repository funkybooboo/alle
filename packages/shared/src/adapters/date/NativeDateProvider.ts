import type { DateProvider } from './DateProvider';

/**
 * Date provider implementation using native JavaScript Date
 *
 * Runtime-agnostic implementation that works in both browser and Bun.
 *
 * TIMEZONE MODEL
 * --------------
 * By default (`timeZone === null`) "today" is the calendar day in the host's
 * LOCAL timezone -- i.e. what the user's clock says. A user can override this
 * with an explicit IANA zone (`America/Denver`) via setTimeZone(); "today",
 * timestamp grouping, and the live clock then follow the chosen zone instead,
 * even though the browser's Date local-getters remain fixed to the device zone.
 *
 * DATE-KEY ARITHMETIC IS DST-PROOF
 * --------------------------------
 * Calendar-date keys (`YYYY-MM-DD`) are manipulated as pure Gregorian dates
 * via `Date.UTC`, NOT via 24-hour `setDate` on a Date. The latter drifts on
 * DST transition days (a 23h or 25h wall day) and in non-UTC device zones.
 * `Date.UTC(y, m-1, d + days)` rolls month/year correctly and has no DST.
 *
 * DISPLAY VS CURRENT-DAY
 * ---------------------
 * formatDate() formats a STORED date key as a calendar label. A calendar date
 * ("August 02, 2026") means the same thing in every timezone, so it is anchored
 * to `timeZone: 'UTC'` to be immune to both host and user zone -- it never
 * shifts. Only "what is today" (today, dateFromTimestamp, the live clock) is
 * zone-dependent.
 */
export class NativeDateProvider implements DateProvider {
    /** Effective IANA timezone, or null to follow the device's local zone. */
    private timeZone: string | null = null;

    /**
     * @param timeZone - Optional IANA timezone (e.g. 'America/Denver').
     * null/undefined => follow the device's local timezone. Validated here.
     */
    constructor(timeZone: string | null = null) {
        if (timeZone) {
            this.setTimeZone(timeZone);
        }
    }

    /**
     * Set the timezone used to resolve "today"/timestamps. Pass null to
     * follow the device's local zone. Throws RangeError on an unknown zone.
     */
    setTimeZone(timeZone: string | null): void {
        if (timeZone !== null && timeZone !== '') {
            // Validate eagerly -- Intl.DateTimeFormat throws on unknown zones.
            new Intl.DateTimeFormat('en-US', { timeZone });
            this.timeZone = timeZone;
        } else {
            this.timeZone = null;
        }
    }

    /** Resolve a locale-neutral options object carrying the effective zone. */
    private zoneOptions(): Intl.DateTimeFormatOptions {
        return this.timeZone ? { timeZone: this.timeZone } : {};
    }

    /**
     * Given a Date instant, return its calendar date as a YYYY-MM-DD key in
     * the EFFECTIVE zone (user zone if set, else the host's local zone).
     * Uses Intl formatToParts (zone-aware) -- NOT local getters, which are
     * hardwired to the device zone and ignore this.timeZone.
     */
    private keyFromInstant(date: Date): string {
        if (this.timeZone) {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: this.timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).formatToParts(date);
            const get = (t: string): string => {
                const p = parts.find(x => x.type === t);
                return p ? p.value : '';
            };
            return `${get('year')}-${get('month')}-${get('day')}`;
        }
        const pad = (n: number): string => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    /** Parse a YYYY-MM-DD key into its numeric components. */
    private splitKey(dateStr: string): [number, number, number] {
        const parts = dateStr.split('-').map(Number);
        return [parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1]; // month is 0-indexed
    }

    /** Get the weekday (0=Sunday .. 6=Saturday) for a calendar date. Zone-independent. */
    private weekdayOfKey(dateStr: string): number {
        const [y, m, d] = this.splitKey(dateStr);
        return new Date(Date.UTC(y, m, d)).getUTCDay();
    }

    /** Rebuild a YYYY-MM-DD key from UTC year/month/day numbers. */
    private keyFromUtcParts(y: number, m: number, d: number): string {
        const pad = (n: number): string => String(n).padStart(2, '0');
        return `${y}-${pad(m + 1)}-${pad(d)}`;
    }

    /**
     * Add days to a calendar date via Date.UTC -- DST-proof, zone-independent.
     * Negative days supported. Month/year boundaries roll over correctly.
     */
    private addDaysToKey(dateStr: string, days: number): string {
        const [y, m, d] = this.splitKey(dateStr);
        const shifted = new Date(Date.UTC(y, m, d + days));
        return this.keyFromUtcParts(
            shifted.getUTCFullYear(),
            shifted.getUTCMonth(),
            shifted.getUTCDate(),
        );
    }

    /**
     * Get today's date in ISO 8601 format (YYYY-MM-DD), in the effective zone.
     */
    today(): string {
        return this.keyFromInstant(new Date());
    }

    /**
     * Get tomorrow's date in ISO 8601 format (YYYY-MM-DD), in the effective zone.
     */
    tomorrow(): string {
        return this.addDaysToKey(this.today(), 1);
    }

    /**
     * Get yesterday's date in ISO 8601 format (YYYY-MM-DD), in the effective zone.
     */
    yesterday(): string {
        return this.addDaysToKey(this.today(), -1);
    }

    /**
     * Add days to a date. DST-proof, zone-independent (operates on calendar dates).
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @param days - Number of days to add (can be negative)
     * @returns New date in ISO 8601 format
     */
    addDays(dateStr: string, days: number): string {
        return this.addDaysToKey(dateStr, days);
    }

    /**
     * Get the start of the week (Monday) for a given date.
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @returns Monday of that week in ISO 8601 format
     */
    startOfWeek(dateStr: string): string {
        const day: number = this.weekdayOfKey(dateStr);
        // Sunday returns 0, but weeks start on Monday.
        const diff: number = day === 0 ? -6 : 1 - day;
        return this.addDaysToKey(dateStr, diff);
    }

    /**
     * Get the end of the week (Sunday) for a given date.
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @returns Sunday of that week in ISO 8601 format
     */
    endOfWeek(dateStr: string): string {
        const day: number = this.weekdayOfKey(dateStr);
        const diff: number = day === 0 ? 0 : 7 - day;
        return this.addDaysToKey(dateStr, diff);
    }

    /**
     * Get an array of dates for the current week (Monday to Sunday)
     * @returns Array of 7 date strings in ISO 8601 format
     */
    currentWeekDates(): string[] {
        const monday = this.startOfWeek(this.today());
        const dates: string[] = [];
        for (let i = 0; i < 7; i++) {
            dates.push(this.addDaysToKey(monday, i));
        }
        return dates;
    }

    /**
     * Format a STORED date string for display. A calendar date label is
     * zone-independent ("August 02, 2026" means the same thing everywhere), so
     * this anchors to UTC and never shifts with the user or device zone.
     * Day-of-month is always 2-digit for consistent column alignment.
     *
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @param format - 'short' (Aug 02, 2026) | 'long' (August 02, 2026)
     *                 | 'full' (Sunday, August 02, 2026) | 'weekday' (Sunday)
     * @returns Formatted date string
     */
    formatDate(dateStr: string, format: 'short' | 'long' | 'full' | 'weekday' = 'short'): string {
        const [y, m, d] = this.splitKey(dateStr);
        // Anchor at UTC noon so the instant's UTC calendar date equals the key;
        // formatting with timeZone:'UTC' guarantees the displayed date matches
        // the key regardless of host or user zone. Noon avoids any edge case at
        // midnight rounding in exotic formatters.
        const date = new Date(Date.UTC(y, m, d, 12, 0, 0));
        const opts: Intl.DateTimeFormatOptions = { timeZone: 'UTC' };

        switch (format) {
            case 'short':
                return date.toLocaleDateString('en-US', {
                    ...opts,
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                });
            case 'long':
                return date.toLocaleDateString('en-US', {
                    ...opts,
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                });
            case 'full':
                return date.toLocaleDateString('en-US', {
                    ...opts,
                    weekday: 'long',
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric',
                });
            case 'weekday':
                return date.toLocaleDateString('en-US', { ...opts, weekday: 'long' });
            default:
                return dateStr;
        }
    }

    /**
     * Check if a date string is today (in the effective zone)
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isToday(dateStr: string): boolean {
        return dateStr === this.today();
    }

    /**
     * Check if a date string is in the past (before today, in the effective zone)
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isPast(dateStr: string): boolean {
        return dateStr < this.today();
    }

    /**
     * Check if a date string is in the future (after today, in the effective zone)
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isFuture(dateStr: string): boolean {
        return dateStr > this.today();
    }

    /**
     * Get a timestamp in ISO 8601 format with time (for createdAt/updatedAt).
     * Always a real UTC instant, NOT affected by the user zone preference.
     */
    timestamp(): string {
        return new Date().toISOString();
    }

    /**
     * Parse a timestamp and get the date part (YYYY-MM-DD) in the EFFECTIVE
     * zone (user zone if set, else device local). A UTC instant near midnight
     * thus groups onto the wall-clock day the user is actually experiencing.
     * @param isoTimestamp - ISO 8601 timestamp
     */
    dateFromTimestamp(isoTimestamp: string): string {
        return this.keyFromInstant(new Date(isoTimestamp));
    }

    /**
     * Format a Date instant as a wall-clock time string honoring timeFormat.
     * The effective zone (user or device) applies.
     * @param date - The instant to format
     * @param timeFormat - '12h' (08:53 PM) or '24h' (20:53)
     */
    formatTime(date: Date, timeFormat: '12h' | '24h'): string {
        const opts: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: timeFormat !== '24h',
            ...this.zoneOptions(),
        };
        return date.toLocaleTimeString('en-US', opts);
    }

    /**
     * Format a Date instant as a full date-time string for a live "today" label.
     * Zone-dependent (uses the effective zone). Returns "Sunday, August 02, 2026 . 08:53 PM".
     * @param date - The instant (typically `new Date()`)
     * @param timeFormat - '12h' or '24h'
     */
    formatDateTime(date: Date, timeFormat: '12h' | '24h' = '12h'): string {
        const datePart = date.toLocaleDateString('en-US', {
            ...this.zoneOptions(),
            weekday: 'long',
            month: 'long',
            day: '2-digit',
            year: 'numeric',
        });
        return `${datePart} \u00b7 ${this.formatTime(date, timeFormat)}`;
    }

    /**
     * Get number of days between two dates. DST-proof (uses UTC midnight of
     * the calendar dates; UTC has no DST).
     * @param dateStr1 - ISO 8601 date string (YYYY-MM-DD)
     * @param dateStr2 - ISO 8601 date string (YYYY-MM-DD)
     * @returns Number of days (positive if dateStr2 is after dateStr1)
     */
    daysBetween(dateStr1: string, dateStr2: string): number {
        const [y1, m1, d1] = this.splitKey(dateStr1);
        const [y2, m2, d2] = this.splitKey(dateStr2);
        const ms = Date.UTC(y2, m2, d2) - Date.UTC(y1, m1, d1);
        return Math.round(ms / (1000 * 60 * 60 * 24));
    }

    /**
     * Decompose a STORED date into its named parts for columnar display.
     * Each part is formatted against UTC (zone-independent, like formatDate)
     * so columns align identically across hosts/users in different zones.
     * Day-of-month is always 2-digit.
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @returns { weekday, month, day, year } strings
     */
    formatDateParts(dateStr: string): {
        weekday: string;
        month: string;
        day: string;
        year: string;
        weekdayShort: string;
        monthShort: string;
    } {
        const [y, m, d] = this.splitKey(dateStr);
        // Anchor at UTC noon (matches formatDate) so weekday/month come out
        // correct for the calendar date regardless of host or user zone.
        const date = new Date(Date.UTC(y, m, d, 12, 0, 0));
        const opts: Intl.DateTimeFormatOptions = { timeZone: 'UTC' };
        return {
            weekday: date.toLocaleDateString('en-US', { ...opts, weekday: 'long' }),
            month: date.toLocaleDateString('en-US', { ...opts, month: 'long' }),
            day: date.toLocaleDateString('en-US', { ...opts, day: '2-digit' }),
            year: date.toLocaleDateString('en-US', { ...opts, year: 'numeric' }),
            weekdayShort: date
                .toLocaleDateString('en-US', { ...opts, weekday: 'short' })
                .toUpperCase(),
            monthShort: date.toLocaleDateString('en-US', { ...opts, month: 'short' }).toUpperCase(),
        };
    }

    /**
     * Validate if a string is a valid ISO 8601 date (YYYY-MM-DD).
     * Rejects overflowing dates like 2026-02-30 (verifies the date didn't roll
     * over to the next month), which a bare NaN check would have missed.
     */
    isValidDate(dateStr: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateStr)) return false;

        const [y, m, d] = this.splitKey(dateStr);
        const dt = new Date(Date.UTC(y, m, d));
        return dt.getUTCFullYear() === y && dt.getUTCMonth() === m && dt.getUTCDate() === d;
    }
}
