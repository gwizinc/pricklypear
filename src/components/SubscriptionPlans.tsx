import React from "react";
import { Link } from "react-router-dom";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from "@/constants/subscription-plans";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Pricing / subscription options section shown on the home page.
 */
function SubscriptionPlans() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="w-full bg-bgLight py-16 px-4"
    >
      <div className="container mx-auto max-w-5xl">
        <h2
          id="pricing-heading"
          className="text-3xl md:text-4xl font-extrabold font-rounded text-center mb-12"
        >
          Choose the plan that fits your family
        </h2>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SubscriptionPlans;

type PricingCardProps = {
  plan: SubscriptionPlan;
};

function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-card hover:bg-bgLight transition-all hover-tilt flex flex-col",
      )}
    >
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-bold font-rounded mb-2 text-primary text-center">
          {plan.name}
        </h3>
        <p className="text-2xl font-extrabold text-center mb-6 text-accent-DEFAULT">
          {plan.price}
        </p>

        <ul className="space-y-3 flex-1" role="list">
          {plan.features.map((feature) => (
            <li key={feature} className="text-textBody flex items-start">
              <span className="material-symbols-outlined text-secondary-DEFAULT mr-2 mt-[2px]">
                check_circle
              </span>
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
          <Link to={plan.ctaPath}>Select</Link>
        </Button>
      </div>
    </div>
  );
}
