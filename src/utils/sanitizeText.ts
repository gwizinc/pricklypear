/**
 * Removes a single leading and trailing double-quote from the supplied text.
 * If the text is not wrapped in double quotes it is returned unchanged.
 */
export function sanitizeText(text: string): string {
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  return text;
}
