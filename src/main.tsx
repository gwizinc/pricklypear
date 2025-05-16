import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from "react";
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";

Sentry.init({
  dsn: "https://f0b39040299b245a914fdd95a6425c8b@o4504148959756288.ingest.us.sentry.io/4509333190148096",
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  sendDefaultPii: true,
  tracesSampleRate: 1.0, // Adjust this value in production
});

createRoot(document.getElementById("root")!).render(<App />);
