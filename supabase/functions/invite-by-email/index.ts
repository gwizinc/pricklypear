import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.5.0";

const APP_CONNECTIONS_URL = "https://pricklypear-three.vercel.app/connections";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Derive a human-friendly name for display in emails.
 */
function getDisplayName(args: {
  user_metadata: Record<string, unknown> | null;
  email: string | null;
}): string {
  const { user_metadata, email } = args;

  if (
    user_metadata &&
    typeof user_metadata === "object" &&
    "full_name" in user_metadata &&
    typeof user_metadata.full_name === "string" &&
    user_metadata.full_name.trim() !== ""
  ) {
    return (user_metadata.full_name as string).trim();
  }

  // Fallback → part before the @
  return email ? email.split("@")[0] : "Someone";
}

/**
 * Send an email via the Resend SDK.  Logs on failure but never throws.
 */
async function sendEmail(args: { to: string; subject: string; html: string }) {
  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing – skipping email send");
    return;
  }

  const resend = new Resend(apiKey);
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!from) {
    console.warn("RESEND_FROM_EMAIL missing – skipping email send");
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
  });

  if (error) console.error("Resend error:", error);
}

serve(async (req) => {
  // CORS pre-flight
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Both userId and email are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey)
      throw new Error("Missing Supabase credentials");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Fetch inviter (sender)
    const { data: inviterProfile, error: inviterProfileErr } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .maybeSingle();
    if (inviterProfileErr || !inviterProfile)
      throw new Error("Inviter profile not found");

    const inviterName = inviterProfile.name;

    // ── Attempt invitee lookup (case-insensitive)
    const { data: inviteeUser, error: inviteeErr } = await supabase
      .from("users", { schema: "auth" })
      .select("id, email, user_metadata")
      .ilike("email", email)
      .maybeSingle();
    if (inviteeErr) throw inviteeErr;

    // ── Send invitation email
    const subject = `${inviterName} invited you on PricklyPear`;
    const htmlExisting = `
      <p>Hi there,</p>
      <p><strong>${inviterName}</strong> has invited you to connect on PricklyPear.</p>
      <p>Please <a href="${APP_CONNECTIONS_URL}">visit your connections</a> to accept the request.</p>
      <p>See you soon!</p>
    `;
    const htmlNew = `
      <p>Hi there,</p>
      <p><strong>${inviterName}</strong> has invited you to join PricklyPear.</p>
      <p>Create an account and connect at <a href="${APP_CONNECTIONS_URL}">PricklyPear</a>.</p>
      <p>We look forward to having you!</p>
    `;
    await sendEmail({
      to: email,
      subject,
      html: inviteeUser ? htmlExisting : htmlNew,
    });

    // ── If invitee already has an account, proceed with connection logic
    if (inviteeUser) {
      // Check for an existing connection in either direction
      const { data: existing1 } = await supabase
        .from("connections")
        .select("id")
        .eq("user_id", userId)
        .eq("connected_user_id", inviteeUser.id)
        .maybeSingle();
      const { data: existing2 } = await supabase
        .from("connections")
        .select("id")
        .eq("user_id", inviteeUser.id)
        .eq("connected_user_id", userId)
        .maybeSingle();

      if (existing1 || existing2) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Connection already exists",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create the pending connection
      const { data: connection, error: insertErr } = await supabase
        .from("connections")
        .insert({
          user_id: userId,
          connected_user_id: inviteeUser.id,
          status: "pending",
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      const avatarUrl =
        (inviteeUser.user_metadata as { avatar_url?: string } | null)
          ?.avatar_url ?? undefined;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Connection request sent to ${inviteeUser.email}`,
          connection: {
            id: connection.id,
            otherUserId: inviteeUser.id,
            username: inviteeUser.email ?? "Unknown User",
            avatarUrl,
            status: connection.status,
            createdAt: connection.created_at,
            updatedAt: connection.updated_at,
            isUserSender: true,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Invitee not yet a user: email sent, nothing else to do
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation email sent to ${email}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("invite-by-email error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
