/**
 * Sanitises user-generated text by
 * 1. trimming leading/trailing whitespace
 * 2. removing one matching pair of leading & trailing quotes
 *    – works for both single (') and double (") quotes
 * 3. trimming once more in case inner whitespace was exposed
 *
 * If the string is shorter than two characters, or is **not**
 * wrapped in the same quote type, the original (trimmed) text
 * is returned unchanged.
 *
 * @param {string} text - Raw text from the database / user input
 * @returns {string} Sanitised text ready for display / processing
 */
export function sanitizeText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 2) return trimmed;

  const first = trimmed.charAt(0);
  const last = trimmed.charAt(trimmed.length - 1);

  const isWrappedInMatchingQuotes =
    (first === '"' && last === '"') || (first === "'" && last === "'");

  return isWrappedInMatchingQuotes ? trimmed.slice(1, -1).trim() : trimmed;
}
