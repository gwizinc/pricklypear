import {
  isToday,
  isYesterday,
  differenceInCalendarDays,
  format,
} from "date-fns";

/**
 * Converts a Date into a human-friendly string for thread messages.
 *
 * Rules:
 *  • Today – "1:04 pm"
 *  • Yesterday – "Yesterday 1:04 pm"
 *  • Last 7 days – "Monday 1:04 PM"
 *  • Older – "Mon, Jan 23 at 1:04 PM"
 *
 * @param {Date} date - The date to format.
 * @param {Date} [now=new Date()] - Reference date, handy for tests.
 * @returns {string} The formatted timestamp.
 */
export function formatThreadTimestamp(
  date: Date,
  now: Date = new Date(),
): string {
  if (isToday(date)) {
    return format(date, "h:mm a").toLowerCase();
  }

  if (isYesterday(date)) {
    return `Yesterday ${format(date, "h:mm a").toLowerCase()}`;
  }

  if (differenceInCalendarDays(now, date) < 7) {
    return format(date, "EEEE h:mm a");
  }

  return format(date, "EEE, MMM d 'at' h:mm a");
}
