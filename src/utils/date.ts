/**
 * Format a date into a human-readable string.
 * 
 * @param date - The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Format as "MMM D, YYYY" (e.g., "Jan 1, 2024")
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
} 