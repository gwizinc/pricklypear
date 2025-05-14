import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import SubscriptionPlans from "./SubscriptionPlans";
import { SUBSCRIPTION_PLANS } from "@/constants/subscription-plans";

describe("<SubscriptionPlans />", () => {
  it("renders all plan names", () => {
    render(
      <MemoryRouter>
        <SubscriptionPlans />
      </MemoryRouter>,
    );

    SUBSCRIPTION_PLANS.forEach(({ name }) => {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    });
  });

  it("renders at least one feature from each plan", () => {
    render(
      <MemoryRouter>
        <SubscriptionPlans />
      </MemoryRouter>,
    );

    SUBSCRIPTION_PLANS.forEach(({ features }) => {
      // Check the first feature only; sufficient for smoke test.
      expect(screen.getByText(features[0])).toBeInTheDocument();
    });

    // Verify section headings are present
    expect(
      screen.getByRole("heading", { name: /Plans and Pricing/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Choose a plan/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Included in every plan/i }),
    ).toBeInTheDocument();
  });
});
