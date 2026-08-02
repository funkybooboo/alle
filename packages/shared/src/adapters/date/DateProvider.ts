/**
 * Date provider interface
 *
 * Provides date and time operations using ISO 8601 format.
 * All dates are stored as ISO 8601 strings (YYYY-MM-DD for dates).
 *
 * This adapter pattern allows:
 * - Easy testing with mock implementations
 * - Swapping date libraries (date-fns, dayjs, luxon) without changing business logic
 * - Consistent date handling across client and server
 * - Timezone override support via setTimeZone()
 */
export interface DateProvider {
    /**
     * Get today's date in ISO 8601 format (YYYY-MM-DD), in the effective zone
     */
    today(): string;

    /**
     * Get tomorrow's date in ISO 8601 format (YYYY-MM-DD), in the effective zone
     */
    tomorrow(): string;

    /**
     * Get yesterday's date in ISO 8601 format (YYYY-MM-DD), in the effective zone
     */
    yesterday(): string;

    /**
     * Get a timestamp in ISO 8601 format with time (for createdAt/updatedAt).
     * Always a real UTC instant, unaffected by the user zone preference.
     */
    timestamp(): string;

    /**
     * Add days to a date. DST-proof, zone-independent (operates on calendar dates).
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @param days - Number of days to add (can be negative)
     * @returns New date in ISO 8601 format
     */
    addDays(dateStr: string, days: number): string;

    /**
     * Get the start of the week (Monday) for a given date
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @returns Monday of that week in ISO 8601 format
     */
    startOfWeek(dateStr: string): string;

    /**
     * Get the end of the week (Sunday) for a given date
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @returns Sunday of that week in ISO 8601 format
     */
    endOfWeek(dateStr: string): string;

    /**
     * Get an array of dates for the current week (Monday to Sunday)
     * @returns Array of 7 date strings in ISO 8601 format
     */
    currentWeekDates(): string[];

    /**
     * Format a STORED date string for display. Calendar dates are
     * zone-independent, so this is anchored to UTC and ignores the user zone.
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @param format - 'short' (Aug 02, 2026), 'long' (August 02, 2026),
     *                 'full' (Sunday, August 02, 2026), 'weekday' (Sunday)
     * @returns Formatted date string
     */
    formatDate(dateStr: string, format: 'short' | 'long' | 'full' | 'weekday'): string;

    /**
     * Format a Date instant as a wall-clock time honoring timeFormat and the
     * effective timezone (user zone if set, else device local).
     * @param date - The instant to format
     * @param timeFormat - '12h' (08:53 PM) or '24h' (20:53)
     */
    formatTime(date: Date, timeFormat: '12h' | '24h'): string;

    /**
     * Format a Date instant as a full date-time string for a "today" label,
     * using the effective timezone. Returns e.g. "Sunday, August 02, 2026 . 08:53 PM".
     * @param date - The instant (typically `new Date()`)
     * @param timeFormat - '12h' or '24h'
     */
    formatDateTime(date: Date, timeFormat: '12h' | '24h'): string;

    /**
     * Check if a date string is today (in the effective zone)
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isToday(dateStr: string): boolean;

    /**
     * Check if a date string is in the past (before today, in the effective zone)
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isPast(dateStr: string): boolean;

    /**
     * Check if a date string is in the future (after today, in the effective zone)
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isFuture(dateStr: string): boolean;

    /**
     * Parse a timestamp and get the date part (YYYY-MM-DD) in the EFFECTIVE zone.
     * @param isoTimestamp - ISO 8601 timestamp
     */
    dateFromTimestamp(isoTimestamp: string): string;

    /**
     * Get number of days between two dates. DST-proof.
     * @param dateStr1 - ISO 8601 date string (YYYY-MM-DD)
     * @param dateStr2 - ISO 8601 date string (YYYY-MM-DD)
     * @returns Number of days (positive if dateStr2 is after dateStr1)
     */
    daysBetween(dateStr1: string, dateStr2: string): number;

    /**
     * Validate if a string is a valid ISO 8601 date (YYYY-MM-DD)
     * @param dateStr - Date string to validate
     */
    isValidDate(dateStr: string): boolean;

    /**
     * Set the timezone used to resolve "today"/timestamps. Pass an IANA zone
     * (e.g. 'America/Denver') or null to follow the device's local timezone.
     * Throws RangeError on an unknown zone.
     */
    setTimeZone(timeZone: string | null): void;

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
    };
}

/**
 * Error thrown by DateProvider implementations
 */
export class DateProviderError extends Error {
    public readonly errorCause?: unknown;

    constructor(message: string, errorCause?: unknown) {
        super(message);
        this.name = 'DateProviderError';
        this.errorCause = errorCause;
    }
}
