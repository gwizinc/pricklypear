import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Subscription } from "@/types/subscription";

/**
 * Row shape for the `subscriptions` table.
 * Extend or refine as the schema evolves.
 */
type SubscriptionRow = {
  price_id: string | null;
  plan_name: string | null;
  interval: string | null;
  is_active: boolean | null;
  current_period_end: string | null;
  status: string | null;
};

/**
 * Extracts the subscription metadata from the current Supabase user and
 * (optionally) refreshes it from the yet-to-be-implemented `subscriptions` table.
 *
 * @returns {{ subscription: Subscription | null; loading: boolean; refresh: () => Promise<void> }}
 */
export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Maps an arbitrary object (metadata row or DB record) into a `Subscription`.
   */
  const mapToSubscription = (
    raw: Record<string, unknown> | null,
  ): Subscription | null => {
    if (!raw) return null;

    return {
      priceId: typeof raw.price_id === "string" ? raw.price_id : null,
      planName: typeof raw.plan_name === "string" ? raw.plan_name : null,
      interval: typeof raw.interval === "string" ? raw.interval : null,
      isActive: raw.is_active === true || raw.status === "active",
      currentPeriodEnd:
        typeof raw.current_period_end === "string"
          ? raw.current_period_end
          : null,
      status: typeof raw.status === "string" ? raw.status : null,
    };
  };

  /**
   * Refreshes subscription information.
   * Currently reads metadata only but contains a forward-compatible DB fetch.
   */
  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Client-side metadata (present today)
      const metaSub = mapToSubscription(
        (user.user_metadata?.subscription ?? null) as Record<
          string,
          unknown
        > | null,
      );

      // 2. Future server data (ignore for now – wrapped in try/catch)
      let dbSub: Subscription | null = null;
      try {
        const { data } = await supabase
          .from<SubscriptionRow>("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        dbSub = mapToSubscription(data);
      } catch {
        /* swallow silently – table may not exist yet */
      }

      // Prefer server data when available, else fallback to metadata
      setSubscription(dbSub ?? metaSub);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { subscription, loading, refresh };
}
