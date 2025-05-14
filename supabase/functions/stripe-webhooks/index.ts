import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.16.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  /* CORS pre-flight */
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecretKey || !webhookSecret) {
    console.error("Missing Stripe secrets");
    return new Response("Config error", { status: 500 });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return new Response("Config error", { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-04-10",
  });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response("Invalid signature", { status: 400 });
  }

  /* Persist raw event for audit/debug */
  try {
    await supabase.from("stripe_events").insert({
      id: event.id,
      type: event.type,
      payload: event as unknown as Record<string, unknown>,
    });
  } catch (e) {
    console.error("Failed to persist stripe event", e);
  }

  try {
    switch (event.type) {
      /* ------------------------------------------------------------------ */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_id: subscriptionId,
            })
            .eq("id", profile.id);
        }
        break;
      }
      /* ------------------------------------------------------------------ */
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          const status =
            event.type === "invoice.payment_succeeded" ? "active" : "past_due";

          /* Update profile subscription status */
          await supabase
            .from("profiles")
            .update({
              subscription_status: status,
              subscription_current_period_end: new Date(
                (invoice.period_end ?? 0) * 1000,
              ).toISOString(),
            })
            .eq("id", profile.id);

          /* Record payment attempt */
          await supabase.from("payments").insert({
            profile_id: profile.id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid,
            status: invoice.status,
            period_start: new Date(
              (invoice.period_start ?? 0) * 1000,
            ).toISOString(),
            period_end: new Date(
              (invoice.period_end ?? 0) * 1000,
            ).toISOString(),
          });
        }
        break;
      }
      /* ------------------------------------------------------------------ */
      default:
        /* unhandled event - ignore */
        break;
    }
  } catch (e) {
    console.error(`Failed to handle Stripe event ${event.type}`, e);
    /* continue to ack so Stripe doesn’t retry forever */
  }

  return new Response("ok", {
    headers: corsHeaders,
  });
});
