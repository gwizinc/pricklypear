import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

/**
 * Vite configuration
 *
 *  • Adds the React-SWC plugin (same as vitest.config.ts)
 *  • Mirrors the "@" path alias used throughout the project
 *  • Forwards all variables that start with either `VITE_` (default)
 *    or `VERCEL_` so they are available via `import.meta.env.*`
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  envPrefix: ["VITE_", "VERCEL_"],
});
