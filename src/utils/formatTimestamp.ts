import { format, isToday, isYesterday, isThisWeek } from "date-fns";

/**
 * Format a timestamp according to DD-40 rules.
 *
 *  • Today         → "hh:mm a"
 *  • Yesterday     → "Yesterday, hh:mm a"
 *  • Same week     → "EEE, hh:mm a"         (week starts on Monday)
 *  • Older         → "MMM d, EEE hh:mm a"
 *
 * @param {Date} date - The date to format
 * @returns {string}  - Human-readable timestamp
 */
export function formatThreadTimestamp(date: Date): string {
  if (isToday(date)) {
    return format(date, "hh:mm a");
  }

  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "hh:mm a")}`;
  }

  if (isThisWeek(date, { weekStartsOn: 1 })) {
    return `${format(date, "EEE")}, ${format(date, "hh:mm a")}`;
  }

  return format(date, "MMM d, EEE hh:mm a");
}
