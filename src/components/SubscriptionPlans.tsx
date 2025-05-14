import React from "react";
import { Link } from "react-router-dom";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from "@/constants/subscription-plans";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

/**
 * Pricing / subscription options section shown on the home page.
 */
function SubscriptionPlans() {
  const monthlyPlans = SUBSCRIPTION_PLANS.filter(
    (plan) => plan.category === "monthly",
  );
  const perRequestPlans = SUBSCRIPTION_PLANS.filter(
    (plan) => plan.category === "perRequest",
  );

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="w-full bg-bgLight py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="container mx-auto max-w-7xl px-4">
        <h2
          id="pricing-heading"
          className="text-3xl md:text-4xl font-extrabold font-rounded text-center mb-12"
        >
          Choose the plan that fits your family
        </h2>

        <section role="region" aria-labelledby="monthly-plans-heading">
          <h2
            id="monthly-plans-heading"
            className="text-2xl font-semibold mb-4"
          >
            Monthly Plans
          </h2>
          <div className="inline-grid mx-auto grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] gap-6">
            {monthlyPlans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        <section
          role="region"
          aria-labelledby="per-request-plans-heading"
          className="mt-12"
        >
          <h2
            id="per-request-plans-heading"
            className="text-2xl font-semibold mb-4"
          >
            Per-Request Items
          </h2>
          <div className="inline-grid mx-auto grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] gap-6">
            {perRequestPlans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default SubscriptionPlans;

type PlanCardProps = {
  plan: SubscriptionPlan;
};

function PlanCard({ plan }: PlanCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-card hover:bg-bgLight transition-all hover-tilt flex flex-col h-full min-w-[400px]",
      )}
    >
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl md:text-2xl font-bold font-rounded mb-2 text-primary text-center">
          {plan.name}
        </h3>
        <p className="text-2xl md:text-3xl font-extrabold text-center mb-6 text-accent-DEFAULT">
          {plan.price}
        </p>

        <ul className="space-y-3 flex-1" role="list">
          {plan.features.map((feature) => (
            <li key={feature} className="text-textBody flex items-start">
              <CheckCircle2 className="h-4 w-4 text-secondary-DEFAULT mr-2 mt-[2px] flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-8 pt-4">
        <Button
          asChild
          className="w-full bg-secondary hover:bg-secondary/90 hover-rotate"
        >
          <Link to={plan.ctaPath} aria-label={`Select ${plan.name} plan`}>
            {`Select ${plan.name}`}
          </Link>
        </Button>
      </div>
    </div>
  );
}
