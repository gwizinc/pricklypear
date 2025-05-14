/**
 * Commercial subscription attached to an authenticated user.
 *
 * All fields are nullable because the metadata coming from Supabase could be
 * partially filled (or missing entirely) while we migrate towards a dedicated
 * `subscriptions` table.
 */
export interface Subscription {
  /** Stripe (or other PSP) price identifier the user is subscribed to */
  priceId: string | null;
  /** Human-readable plan name (e.g. "Starter", "Pro") */
  planName: string | null;
  /** Billing cadence - "month", "year", etc. */
  interval: string | null;
  /** `true` if the subscription is currently active or in trial */
  isActive: boolean;
  /** ISO date of the current period end (i.e. next renewal / expiry) */
  currentPeriodEnd: string | null;
  /** Raw status as reported by the payment provider (e.g. "active", "canceled") */
  status: string | null;
}
