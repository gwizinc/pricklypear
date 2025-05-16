import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { initSentry } from "./utils/sentry.ts";
import App from "./App.tsx";
import "./index.css";

// Initialise monitoring before the first render.
initSentry();

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary
    fallback={<p>Something went wrong – please refresh.</p>}
  >
    <App />
  </Sentry.ErrorBoundary>,
);
