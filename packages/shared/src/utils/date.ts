/**
 * Date and time utilities
 *
 * Provides helper functions for working with dates in ISO 8601 format.
 * All dates in the app are stored as ISO 8601 strings (YYYY-MM-DD for dates).
 */

/**
 * Get today's date in ISO 8601 format (YYYY-MM-DD)
 */
export function today(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get tomorrow's date in ISO 8601 format (YYYY-MM-DD)
 */
export function tomorrow(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

/**
 * Get yesterday's date in ISO 8601 format (YYYY-MM-DD)
 */
export function yesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

/**
 * Add days to a date
 * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
 * @param days - Number of days to add (can be negative)
 * @returns New date in ISO 8601 format
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Get the start of the week (Monday) for a given date
 * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
 * @returns Monday of that week in ISO 8601 format
 */
export function startOfWeek(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day // Adjust when day is Sunday (0)
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]
}

/**
 * Get the end of the week (Sunday) for a given date
 * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
 * @returns Sunday of that week in ISO 8601 format
 */
export function endOfWeek(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDay()
  const diff = day === 0 ? 0 : 7 - day
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]
}

/**
 * Get an array of dates for the current week (Monday to Sunday)
 * @returns Array of 7 date strings in ISO 8601 format
 */
export function currentWeekDates(): string[] {
  const todayStr = today()
  const monday = startOfWeek(todayStr)
  const dates: string[] = []

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(monday, i))
  }

  return dates
}

/**
 * Format a date string for display
 * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
 * @param format - Format type: 'short' (Jan 19), 'long' (January 19, 2026), 'weekday' (Monday)
 * @returns Formatted date string
 */
export function formatDate(
  dateStr: string,
  format: 'short' | 'long' | 'weekday' = 'short'
): string {
  const date = new Date(dateStr)

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'weekday':
      return date.toLocaleDateString('en-US', { weekday: 'long' })
    default:
      return dateStr
  }
}

/**
 * Check if a date string is today
 * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
 */
export function isToday(dateStr: string): boolean {
  return dateStr === today()
}

/**
 * Check if a date string is in the past
 * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
 */
export function isPast(dateStr: string): boolean {
  return dateStr < today()
}

/**
 * Check if a date string is in the future
 * @param dateStr - ISO 8601 date string (YYYY-MM-DD)
 */
export function isFuture(dateStr: string): boolean {
  return dateStr > today()
}

/**
 * Get a timestamp in ISO 8601 format with time (for createdAt/updatedAt)
 */
export function timestamp(): string {
  return new Date().toISOString()
}

/**
 * Parse a timestamp and get the date part (YYYY-MM-DD)
 * @param isoTimestamp - ISO 8601 timestamp
 */
export function dateFromTimestamp(isoTimestamp: string): string {
  return isoTimestamp.split('T')[0]
}

/**
 * Get number of days between two dates
 * @param dateStr1 - ISO 8601 date string (YYYY-MM-DD)
 * @param dateStr2 - ISO 8601 date string (YYYY-MM-DD)
 * @returns Number of days (positive if dateStr2 is after dateStr1)
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const date1 = new Date(dateStr1)
  const date2 = new Date(dateStr2)
  const diffTime = date2.getTime() - date1.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Validate if a string is a valid ISO 8601 date (YYYY-MM-DD)
 */
export function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}
