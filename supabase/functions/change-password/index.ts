import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.5.0";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(25, "Password must be at most 25 characters")
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Password must include at least one special character",
    }),
});

const RATE_LIMIT = 5; // max password changes per hour

function getSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase credentials");
  }
  return createClient(supabaseUrl, serviceKey, {
    global: {
      headers: { Authorization: req.headers.get("Authorization") ?? "" },
    },
  });
}

async function sendConfirmationEmail(args: {
  to: string;
  firstName: string;
  ip: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "";
  if (!apiKey || !from) {
    console.warn("Resend env vars missing – skipping email send");
    return;
  }
  const resend = new Resend(apiKey);

  const nowIso = new Date()
    .toISOString()
    .replace("T", " ")
    .replace("Z", " UTC");

  const resetUrl =
    (Deno.env.get("APP_URL") ?? "https://pricklypear-three.vercel.app") +
    "/auth/reset-password";
  const supportUrl = "https://pricklypear.app/help";

  const subject = "Your Prickly Pear password was updated";

  const text = `
Hi ${args.firstName},

This is a quick confirmation that your Prickly Pear password was changed on ${nowIso} from IP address ${args.ip}.

Didn't request this? Reset your password immediately:
${resetUrl}

Need help? Reply to this email or visit ${supportUrl}.

You're receiving this security notice because you have a Prickly Pear account.
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<body style="background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:24px;">
    <h1 style="font-size:20px;margin:0 0 16px;">Hi ${args.firstName},</h1>
    <p style="margin:0 0 16px;">We're letting you know that your Prickly Pear account password was changed on <strong>${nowIso}</strong> from IP address <strong>${args.ip}</strong>.</p>
    <p style="margin:0 0 16px;">If you <em>didn't</em> make this change, please secure your account right away.</p>
    <p style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Reset your password</a>
    </p>
    <p style="margin:0 0 16px;">If the button doesn’t work, copy and paste this link into your browser:<br/>
      <a href="${resetUrl}">${resetUrl}</a>
    </p>
    <p style="color:#6b7280;font-size:12px;margin-top:32px;">
      Need help? Reply to this email or visit <a href="${supportUrl}">${supportUrl}</a>.<br/><br/>
      You're receiving this security notice because you have a Prickly Pear account.
    </p>
  </div>
</body>
</html>`.trim();

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject,
    html,
    text,
  });
  if (error) {
    console.error("Resend email error:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client and authenticated user
    const supabase = getSupabaseClient(req);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting
    const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount, error: countError } = await supabase
      .from("security_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "PASSWORD_CHANGE")
      .gt("timestamp", sinceIso);
    if (countError) throw countError;
    if ((recentCount ?? 0) >= RATE_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "Too many password changes. Please try later.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse and validate body
    const body = await req.json();
    const parse = passwordSchema.safeParse(body);
    if (!parse.success) {
      return new Response(JSON.stringify({ error: parse.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { currentPassword, newPassword } = parse.data;

    // Verify current password
    const signInRes = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });
    if (signInRes.error) {
      return new Response(
        JSON.stringify({ error: "Current password incorrect" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword },
    );
    if (updateError) {
      console.error("Password update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Insert security event
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const userAgent = req.headers.get("user-agent") ?? "unknown";

    await supabase.from("security_events").insert({
      user_id: user.id,
      type: "PASSWORD_CHANGE",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
    });

    // Send confirmation email (fire and forget)
    sendConfirmationEmail({
      to: user.email!,
      firstName:
        (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
        user.email!.split("@")[0],
      ip,
    }).catch((err) => console.error("sendConfirmationEmail error:", err));

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("change-password error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
