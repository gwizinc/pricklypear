import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── 1. Locate invited user by “name” (stores email)
    const { data: invitedUser, error: invitedErr } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .eq("name", email)
      .maybeSingle();

    if (invitedErr || !invitedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found with that email",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ── 2. Check if a connection already exists in either direction
    const { data: existing1 } = await supabase
      .from("connections")
      .select("id")
      .eq("user_id", userId)
      .eq("connected_user_id", invitedUser.id)
      .maybeSingle();

    const { data: existing2 } = await supabase
      .from("connections")
      .select("id")
      .eq("user_id", invitedUser.id)
      .eq("connected_user_id", userId)
      .maybeSingle();

    if (existing1 || existing2) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Connection already exists",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ── 3. Create the pending connection
    const { data: connection, error: insertErr } = await supabase
      .from("connections")
      .insert({
        user_id: userId,
        connected_user_id: invitedUser.id,
        status: "pending",
      })
      .select()
      .single();

    if (insertErr) {
      throw insertErr;
    }

    // ── 4. Return response compatible with previous InviteResponse
    return new Response(
      JSON.stringify({
        success: true,
        message: `Connection request sent to ${invitedUser.name}`,
        connection: {
          id: connection.id,
          otherUserId: invitedUser.id,
          username: invitedUser.name ?? "Unknown User",
          avatarUrl: invitedUser.avatar_url ?? undefined,
          status: connection.status,
          createdAt: connection.created_at,
          updatedAt: connection.updated_at,
          isUserSender: true,
        },
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
