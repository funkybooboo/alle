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
 * - Future timezone/locale support
 */
export interface DateProvider {
  /**
   * Get today's date in ISO 8601 format (YYYY-MM-DD)
   */
  today(): string

  /**
   * Get tomorrow's date in ISO 8601 format (YYYY-MM-DD)
   */
  tomorrow(): string

  /**
   * Get yesterday's date in ISO 8601 format (YYYY-MM-DD)
   */
  yesterday(): string

  /**
   * Get a timestamp in ISO 8601 format with time (for createdAt/updatedAt)
   */
  timestamp(): string

  /**
   * Add days to a date
   * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
   * @param days - Number of days to add (can be negative)
   * @returns New date in ISO 8601 format
   */
  addDays(dateStr: string, days: number): string

  /**
   * Get the start of the week (Monday) for a given date
   * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
   * @returns Monday of that week in ISO 8601 format
   */
  startOfWeek(dateStr: string): string

  /**
   * Get the end of the week (Sunday) for a given date
   * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
   * @returns Sunday of that week in ISO 8601 format
   */
  endOfWeek(dateStr: string): string

  /**
   * Get an array of dates for the current week (Monday to Sunday)
   * @returns Array of 7 date strings in ISO 8601 format
   */
  currentWeekDates(): string[]

  /**
   * Format a date string for display
   * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
   * @param format - Format type: 'short' (Jan 19), 'long' (January 19, 2026), 'weekday' (Monday)
   * @returns Formatted date string
   */
  formatDate(dateStr: string, format: 'short' | 'long' | 'weekday'): string

  /**
   * Check if a date string is today
   * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
   */
  isToday(dateStr: string): boolean

  /**
   * Check if a date string is in the past
   * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
   */
  isPast(dateStr: string): boolean

  /**
   * Check if a date string is in the future
   * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
   */
  isFuture(dateStr: string): boolean

  /**
   * Parse a timestamp and get the date part (YYYY-MM-DD)
   * @param isoTimestamp - ISO 8601 timestamp
   */
  dateFromTimestamp(isoTimestamp: string): string

  /**
   * Get number of days between two dates
   * @param dateStr1 - ISO 8601 date string (YYYY-MM-DD)
   * @param dateStr2 - ISO 8601 date string (YYYY-MM-DD)
   * @returns Number of days (positive if dateStr2 is after dateStr1)
   */
  daysBetween(dateStr1: string, dateStr2: string): number

  /**
   * Validate if a string is a valid ISO 8601 date (YYYY-MM-DD)
   * @param dateStr - Date string to validate
   */
  isValidDate(dateStr: string): boolean
}

/**
 * Error thrown by DateProvider implementations
 */
export class DateProviderError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'DateProviderError'
  }
}
