/// <reference types="vite/client" />

/**
 * Augments Vite's `ImportMetaEnv` with the `VERCEL_ENV` variable
 * exposed by Vercel at build-time.
 *
 * Possible values:
 *  • "development" – local `vercel dev`
 *  • "preview"     – preview deployments / PR builds
 *  • "production"  – production deployment
 */
interface ImportMetaEnv {
  readonly VERCEL_ENV?: "development" | "preview" | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
