import type { DateProvider } from './DateProvider';

/**
 * Date provider implementation using native JavaScript Date
 *
 * Runtime-agnostic implementation that works in both browser and Bun.
 * Uses the native JavaScript Date API for all date operations.
 */
export class NativeDateProvider implements DateProvider {
    /**
     * Extracts the date portion (YYYY-MM-DD) from an ISO 8601 string
     *
     * @param isoString - Full ISO 8601 date-time string
     * @returns Date portion in YYYY-MM-DD format
     */
    private toDateString(isoString: string): string {
        // ISO format is always YYYY-MM-DDTHH:mm:ss.sssZ, first part is guaranteed to exist
        const datePart: string | undefined = isoString.split('T')[0];
        if (datePart === undefined) {
            throw new Error('Invalid ISO string format');
        }
        return datePart;
    }

    /**
     * Get today's date in ISO 8601 format (YYYY-MM-DD)
     */
    today(): string {
        return this.toDateString(new Date().toISOString());
    }

    /**
     * Get tomorrow's date in ISO 8601 format (YYYY-MM-DD)
     */
    tomorrow(): string {
        const date: Date = new Date();
        date.setDate(date.getDate() + 1);
        return this.toDateString(date.toISOString());
    }

    /**
     * Get yesterday's date in ISO 8601 format (YYYY-MM-DD)
     */
    yesterday(): string {
        const date: Date = new Date();
        date.setDate(date.getDate() - 1);
        return this.toDateString(date.toISOString());
    }

    /**
     * Add days to a date
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @param days - Number of days to add (can be negative)
     * @returns New date in ISO 8601 format
     */
    addDays(dateStr: string, days: number): string {
        const date: Date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return this.toDateString(date.toISOString());
    }

    /**
     * Get the start of the week (Monday) for a given date
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @returns Monday of that week in ISO 8601 format
     */
    startOfWeek(dateStr: string): string {
        const date: Date = new Date(dateStr);
        const day: number = date.getDay();
        // Sunday returns 0, but we want weeks to start on Monday
        // Convert Sunday to -6 and all other days to 1-day
        const diff: number = day === 0 ? -6 : 1 - day;
        date.setDate(date.getDate() + diff);
        return this.toDateString(date.toISOString());
    }

    /**
     * Get the end of the week (Sunday) for a given date
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @returns Sunday of that week in ISO 8601 format
     */
    endOfWeek(dateStr: string): string {
        const date: Date = new Date(dateStr);
        const day: number = date.getDay();
        const diff: number = day === 0 ? 0 : 7 - day;
        date.setDate(date.getDate() + diff);
        return this.toDateString(date.toISOString());
    }

    /**
     * Get an array of dates for the current week (Monday to Sunday)
     * @returns Array of 7 date strings in ISO 8601 format
     */
    currentWeekDates(): string[] {
        const todayStr = this.today();
        const monday = this.startOfWeek(todayStr);
        const dates: string[] = [];

        for (let i = 0; i < 7; i++) {
            dates.push(this.addDays(monday, i));
        }

        return dates;
    }

    /**
     * Format a date string for display
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     * @param format - Format type: 'short' (Jan 19), 'long' (January 19, 2026), 'weekday' (Monday)
     * @returns Formatted date string
     */
    formatDate(dateStr: string, format: 'short' | 'long' | 'weekday' = 'short'): string {
        const date = new Date(dateStr);

        switch (format) {
            case 'short':
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            case 'long':
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            case 'weekday':
                return date.toLocaleDateString('en-US', { weekday: 'long' });
            default:
                return dateStr;
        }
    }

    /**
     * Check if a date string is today
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isToday(dateStr: string): boolean {
        return dateStr === this.today();
    }

    /**
     * Check if a date string is in the past
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isPast(dateStr: string): boolean {
        return dateStr < this.today();
    }

    /**
     * Check if a date string is in the future
     * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
     */
    isFuture(dateStr: string): boolean {
        return dateStr > this.today();
    }

    /**
     * Get a timestamp in ISO 8601 format with time (for createdAt/updatedAt)
     */
    timestamp(): string {
        return new Date().toISOString();
    }

    /**
     * Parse a timestamp and get the date part (YYYY-MM-DD)
     * @param isoTimestamp - ISO 8601 timestamp
     */
    dateFromTimestamp(isoTimestamp: string): string {
        return this.toDateString(isoTimestamp);
    }

    /**
     * Get number of days between two dates
     * @param dateStr1 - ISO 8601 date string (YYYY-MM-DD)
     * @param dateStr2 - ISO 8601 date string (YYYY-MM-DD)
     * @returns Number of days (positive if dateStr2 is after dateStr1)
     */
    daysBetween(dateStr1: string, dateStr2: string): number {
        const date1 = new Date(dateStr1);
        const date2 = new Date(dateStr2);
        const diffTime = date2.getTime() - date1.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Validate if a string is a valid ISO 8601 date (YYYY-MM-DD)
     */
    isValidDate(dateStr: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateStr)) return false;

        const date = new Date(dateStr);
        return !Number.isNaN(date.getTime());
    }
}
