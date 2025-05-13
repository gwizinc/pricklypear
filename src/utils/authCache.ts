import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

let cachedUser: User | null | undefined;   // undefined = not yet fetched

export async function getCurrentUser(
  forceRefresh = false,
): Promise<User | null> {
  // already have a value and we weren't asked to refresh → return it
  if (!forceRefresh && cachedUser !== undefined) return cachedUser;

  // grab it once from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  cachedUser = user ?? null;
  return cachedUser;
}

/* ───────────────────────────────────────────────────────────
   Keep the cache in sync – any sign-in / sign-out event that
   Supabase emits will update (or clear) the cached value.
────────────────────────────────────────────────────────────── */
supabase.auth.onAuthStateChange((_event, session) => {
  cachedUser = session?.user ?? null;
}); 