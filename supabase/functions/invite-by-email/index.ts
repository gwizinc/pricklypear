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

/**
 * Create a Supabase client using environment variables.
 * @returns {ReturnType<typeof createClient>} Supabase client instance
 * @throws {Error} If credentials are missing
 */
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey)
    throw new Error("Missing Supabase credentials");
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Fetch inviter profile by userId.
 * @param {object} args
 * @param {ReturnType<typeof createClient>} args.supabase
 * @param {string} args.userId
 * @returns {Promise<string>} Inviter name
 * @throws {Error} If not found
 */
async function fetchInviterName({ supabase, userId }) {
  const { data: inviterProfile, error } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  if (error || !inviterProfile) throw new Error("Inviter profile not found");
  return inviterProfile.name;
}

/**
 * Fetch invitee user by email (case-insensitive).
 * @param {object} args
 * @param {ReturnType<typeof createClient>} args.supabase
 * @param {string} args.email
 * @returns {Promise<object|null>} Invitee user or null
 * @throws {Error} On query error
 */
async function fetchInviteeUser({ supabase, email }) {
  const { data, error } = await supabase.auth.admin.listUsers({ email });
  if (error) throw error;
  const user = data.users.find(
    (u) => u.email && u.email.toLowerCase() === email.toLowerCase(),
  );
  return user ?? null;
}

/**
 * Send invitation email (existing or new user).
 * @param {object} args
 * @param {string} args.to
 * @param {string} args.inviterName
 * @param {boolean} args.isExistingUser
 */
async function sendInvitationEmail({ to, inviterName, isExistingUser }) {
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
    to,
    subject,
    html: isExistingUser ? htmlExisting : htmlNew,
  });
}

/**
 * Check if a connection already exists between two users.
 * @param {object} args
 * @param {ReturnType<typeof createClient>} args.supabase
 * @param {string} args.userId
 * @param {string} args.inviteeId
 * @returns {Promise<boolean>} True if exists
 */
async function connectionExists({ supabase, userId, inviteeId }) {
  const { data: existing1 } = await supabase
    .from("connections")
    .select("id")
    .eq("user_id", userId)
    .eq("connected_user_id", inviteeId)
    .maybeSingle();
  const { data: existing2 } = await supabase
    .from("connections")
    .select("id")
    .eq("user_id", inviteeId)
    .eq("connected_user_id", userId)
    .maybeSingle();
  return Boolean(existing1 || existing2);
}

/**
 * Create a pending connection between two users.
 * @param {object} args
 * @param {ReturnType<typeof createClient>} args.supabase
 * @param {string} args.userId
 * @param {object} args.inviteeUser
 * @returns {Promise<object>} Connection object
 * @throws {Error} On insert error
 */
async function createPendingConnection({ supabase, userId, inviteeUser }) {
  const { data: connection, error } = await supabase
    .from("connections")
    .insert({
      user_id: userId,
      connected_user_id: inviteeUser.id,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return connection;
}

// Main handler
serve(async (req) => {
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
        },
      );
    }
    const supabase = getSupabaseClient();
    const inviterName = await fetchInviterName({ supabase, userId });
    const inviteeUser = await fetchInviteeUser({ supabase, email });
    await sendInvitationEmail({
      to: email,
      inviterName,
      isExistingUser: Boolean(inviteeUser),
    });
    if (inviteeUser) {
      const exists = await connectionExists({
        supabase,
        userId,
        inviteeId: inviteeUser.id,
      });
      if (exists) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Connection already exists",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const connection = await createPendingConnection({
        supabase,
        userId,
        inviteeUser,
      });
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    // Invitee not yet a user: email sent, create pending connection with NULL connected_user_id
    const { data: connection, error } = await supabase
      .from("connections")
      .insert({
        user_id: userId,
        connected_user_id: null,
        status: "pending",
        invitee_email: email,
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Failed to create pending invitation: ${error.message}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation email sent to ${email} and pending connection created`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
      },
    );
  }
});
