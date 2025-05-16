import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import * as Sentry from "@sentry/react";

let cachedUser: User | null | undefined; // undefined = not yet fetched
let inFlightRequest: Promise<User | null> | null = null; // Track in-flight request

export async function getCurrentUser(
  forceRefresh = false,
): Promise<User | null> {
  // If we have a cached value and aren't forcing refresh, return it
  if (!forceRefresh && cachedUser !== undefined) return cachedUser;

  // If there's already a request in flight, return that promise
  if (inFlightRequest) return inFlightRequest;

  // Create new request
  inFlightRequest = (async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      cachedUser = user ?? null;
      return cachedUser;
    } finally {
      // Clear the in-flight request when done
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

export async function requireCurrentUser(forceRefresh = false): Promise<User> {
  const user = await getCurrentUser(forceRefresh);
  if (!user) {
    throw new Error("No authenticated user found");
  }
  return user;
}

/* ───────────────────────────────────────────────────────────
   Keep the cache in sync – any sign-in / sign-out event that
   Supabase emits will update (or clear) the cached value.
────────────────────────────────────────────────────────────── */
supabase.auth.onAuthStateChange((_event, session) => {
  cachedUser = session?.user ?? null;
  // Clear any in-flight request since the auth state has changed
  inFlightRequest = null;

  // Update Sentry user context on login/logout
  if (session?.user) {
    const { id, email, user_metadata } = session.user;
    Sentry.setUser({
      id,
      email: email ?? undefined,
      ...user_metadata,
    });
  } else {
    Sentry.setUser(null); // Clear Sentry user on logout
  }
});
