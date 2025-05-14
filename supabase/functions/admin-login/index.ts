import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Lightweight admin-only helper that returns a valid magic-link token for any
 * user. The frontend exchanges this token via `verifyOtp`, effectively
 * impersonating the selected user **without** sending mail.
 *
 * Environment variables required (already present in Supabase projects):
 *   • SUPABASE_URL
 *   • SUPABASE_SERVICE_ROLE_KEY
 */
serve(async (req) => {
  // CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = (await req.json()) as { userId?: string };

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      throw new Error(
        "Missing Supabase credentials (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)",
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch the user’s primary e-mail
    const { data: userRes, error: userErr } =
      await admin.auth.admin.getUserById(userId);
    if (userErr || !userRes?.user?.email) {
      throw new Error(userErr?.message ?? "User not found");
    }
    const email = userRes.user.email;

    // Generate a magic-link (email is *not* sent because we use the token directly)
    const { data: linkData, error: linkErr } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkErr || !linkData?.properties?.action_link) {
      throw new Error(linkErr?.message ?? "Failed to generate link");
    }

    const token = new URL(linkData.properties.action_link).searchParams.get(
      "token",
    );
    if (!token) throw new Error("Token parse failed");

    return new Response(JSON.stringify({ token, email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-login error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
