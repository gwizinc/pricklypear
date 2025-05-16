import { useMemo } from "react";

/**
 * React hook to read boolean feature-flags exposed as environment variables
 * with the prefix `VITE_FLAG_`.
 *
 * Example:
 *   VITE_FLAG_ENABLE_PASSWORD_CHANGE=true
 *   const enabled = useFeatureFlag("enablePasswordChange"); // → true
 *
 * The lookup is case-insensitive and camelCase names are converted to
 * CONSTANT_SNAKE_CASE.
 *
 * The implementation guards against runtimes (e.g., Bun) that do **not**
 * define `import.meta.env`, falling back to `process.env` so the hook never
 * throws.
 *
 * @param flagName - Logical flag name (camelCase, kebab-case or snake_case)
 * @returns `true` when the flag is explicitly set to "true" | "1"
 */
export function useFeatureFlag(flagName: string): boolean {
  return useMemo(() => {
    /* normalise `flagName` → ENABLE_PASSWORD_CHANGE */
    const constantName = flagName
      .replace(/[-\s]/g, "_") // kebab / space → underscore
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2") // camel → snake
      .toUpperCase();

    const expectedKey = `VITE_FLAG_${constantName}`;

    /**
     * Some build targets (like Bun) leave `import.meta.env` undefined.  To avoid
     * `Object.entries(undefined)` throwing, we fall back to `process.env` when
     * available—or an empty object as a final safeguard.
     */
    interface ImportMetaWithEnv {
      readonly env?: Record<string, string | boolean | undefined>;
    }

    // Safely obtain an environment object from the available sources
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const metaEnv =
      (import.meta as ImportMeta & ImportMetaWithEnv).env ?? undefined;

    const envSource: Record<string, string | boolean | undefined> =
      metaEnv ?? (typeof process !== "undefined" ? process.env : {});

    /* case-insensitive key search */
    const match = Object.entries(envSource).find(
      ([key]) => key.toUpperCase() === expectedKey,
    );

    if (!match) return false;

    const [, raw] = match;
    return raw === "true" || raw === "1" || raw === true;
  }, [flagName]);
}
