import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

/**
 * Adds `env` to `ImportMeta` so accessing `import.meta.env` type-checks.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface ImportMeta {
    env?: Record<string, string | undefined>;
  }
}

/**
 * Initialise the Sentry browser SDK.
 *
 * If no `SENTRY_DSN` is supplied (common in local dev) the function exits
 * early without initialising anything.
 *
 * @param tracesSampleRate - Fraction (0 – 1) of transactions that should be
 *                           sent to Sentry. Defaults to 0.1 (10 %).
 * @returns {void} Nothing
 */
export function initSentry(args: { tracesSampleRate?: number } = {}): void {
  const { tracesSampleRate = 0.1 } = args;

  // All values are provided at build-time via `import.meta.env` (see build.ts).
  // Avoid using `process` in the browser to prevent ReferenceErrors.
  const env = (import.meta as ImportMeta).env ?? {};
  const dsn = env.SENTRY_DSN;
  const release = env.APP_VERSION;
  const mode = env.NODE_ENV ?? "production";

  if (!dsn) {
    // Nothing to do if the project isn’t configured with a DSN.
    return;
  }

  Sentry.init({
    dsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate,
    environment: mode,
    release,
  });
}
