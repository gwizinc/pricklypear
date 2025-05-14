/**
 * Subscription plan metadata used by the <SubscriptionPlans /> component.
 */

export type SubscriptionPlan = {
  /** Public-facing name shown on the pricing card. */
  name: string;
  /** Price label shown under the name (free, monthly, per-request, etc.). */
  price: string;
  /** Bulleted list of plan features. */
  features: string[];
  /** Path the user is sent to when clicking the plan's call-to-action button. */
  ctaPath: string;
};

export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  {
    name: "Free",
    price: "$0 / mo",
    features: [
      "10 AI-assisted messages / month",
      "Secure, private conversations",
      "Basic tone & clarity suggestions",
    ],
    ctaPath: "/signup?plan=free",
  },
  {
    name: "Growth",
    price: "$10 / mo",
    features: [
      "Unlimited AI-assisted messages",
      "Priority message processing",
      "Conversation sentiment analysis",
      "Email support <24 h",
    ],
    ctaPath: "/signup?plan=growth",
  },
  {
    name: "Legal Assist",
    price: "$200 / request",
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
    features: [
      "Dedicated legal expert",
      "Full document preparation",
      "Unlimited revisions",
      "1-on-1 video consultation",
    ],
    ctaPath: "/contact?plan=custody-change",
  },
] as const;
