/**
 * Subscription plan metadata used by the <SubscriptionPlans /> component.
 */

export type SubscriptionPlanCategory = "monthly" | "perRequest";

/**
 * Metadata for a single subscription plan.
 */
export type SubscriptionPlan = {
  /** Public-facing name shown on the pricing card. */
  name: string;
  /** Price label shown under the name (free, monthly, per-request, etc.). */
  price: string;
  /** Category used to group or style plans (recurring vs one-off). */
  category: SubscriptionPlanCategory;
  /** Bulleted list of plan features. */
  features: string[];
  /** Path the user is sent to when clicking the plan's call-to-action button. */
  ctaPath: string;
};

export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  {
    name: "Free",
    price: "$0 / mo",
    category: "monthly",
    features: [
      "10 AI-assisted messages / month",
      "Secure, private conversations",
      "Basic tone & clarity suggestions",
    ],
    ctaPath: "/signup?plan=free",
  },
  {
    name: "Full Access",
    price: "$10 / mo",
    category: "monthly",
    features: [
      "Unlimited AI-assisted messages",
      "Priority message processing",
      "Email support",
    ],
    ctaPath: "/signup?plan=full-access",
  },
  {
    name: "Legal Assist",
    price: "$200 / request",
    category: "perRequest",
    features: [
      "On-demand attorney review",
      "Detailed rewrite recommendations",
      "24-hour turnaround",
      "Unlimited message history",
    ],
    ctaPath: "/contact?plan=legal-assist",
  },
  {
    name: "Custody Change",
    price: "$500 / change",
    category: "perRequest",
    features: [
      "Dedicated legal expert",
      "Full document preparation",
      "Unlimited revisions",
      "1-on-1 video consultation",
    ],
    ctaPath: "/contact?plan=custody-change",
  },
] as const;
