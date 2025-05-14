import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a Stripe Checkout Session via Supabase Edge Function
 * and returns the redirect URL.
 *
 * @returns {Promise<string | null>} Checkout URL or null on failure
 */
export const createCheckoutSession = async (): Promise<string | null> => {
  const { data, error } = await supabase.functions.invoke(
    "create-checkout-session",
    { body: {} },
  );

  if (error) {
    console.error("create-checkout-session failed:", error);
    return null;
  }

  return data?.url ?? null;
};
