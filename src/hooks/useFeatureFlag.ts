import { useMemo } from "react";

/**
 * React hook to read boolean feature-flags exposed as Vite environment
 * variables:  VITE_FLAG_<FLAG_NAME>
 *
 * Example:
 *   VITE_FLAG_ENABLE_PASSWORD_CHANGE=true
 *   const enabled = useFeatureFlag("enablePasswordChange"); // → true
 *
 * The lookup is case-insensitive and camelCase names are automatically
 * transformed to CONSTANT_SNAKE_CASE.
 *
 * @param flagName - Logical flag name (camelCase, kebab-case or snake_case)
 * @returns `true` when the flag is explicitly set to "true" | "1"
 */
export function useFeatureFlag(flagName: string): boolean {
  return useMemo(() => {
    // normalise `flagName` → ENABLE_PASSWORD_CHANGE
    const constantName = flagName
      .replace(/[-\s]/g, "_") // kebab / space → underscore
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2") // camel → snake
      .toUpperCase();

    const expectedKey = `VITE_FLAG_${constantName}`;

    // find matching env key case-insensitively
    const envEntries = Object.entries(import.meta.env);
    const match = envEntries.find(([key]) => key.toUpperCase() === expectedKey);

    if (!match) return false;

    const [, raw] = match;
    return raw === "true" || raw === "1" || raw === true;
  }, [flagName]);
}
