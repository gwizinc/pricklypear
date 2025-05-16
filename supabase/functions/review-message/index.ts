import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";
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
    // `topic` is optional but, when provided, takes precedence over the DB value.
    const { message, tone = "friendly", threadId, topic } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialise OpenAI once for both classification & rewrite
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    // OPTIONAL ON-TOPIC CLASSIFICATION
    // Runs when either `topic` OR `threadId` is provided.
    // Precedence:
    //   1. Use the supplied `topic` param if truthy.
    //   2. Otherwise, fetch the topic from DB when `threadId` is available.
    // Recent messages are fetched only when `threadId` exists (for extra context).
    // Any failure falls through to the rewrite step (back-compat behaviour).
    const shouldClassify = Boolean(topic || threadId);
    if (shouldClassify) {
      try {
        let threadTopic: string | null | undefined = topic ?? null;
        let recent: string[] = [];

        if (threadId) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL");
          const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          if (supabaseUrl && supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            // Fetch topic from DB ONLY when not provided in request.
            if (!threadTopic) {
              const { data: thread, error: threadErr } = await supabase
                .from("threads")
                .select("topic")
                .eq("id", threadId)
                .maybeSingle();
              if (threadErr) throw threadErr;
              threadTopic = thread?.topic ?? null;
            }

            // Fetch latest 20 messages (newest → oldest then reverse for chronology)
            const { data: messages, error: msgErr } = await supabase
              .from("message_profiles")
              .select("text, profile_name, is_system, timestamp")
              .eq("thread_id", threadId)
              .order("timestamp", { ascending: false })
              .limit(20);
            if (msgErr) throw msgErr;

            recent = (messages ?? []).reverse().map((m) => {
              const sender = m.is_system
                ? "SYSTEM"
                : (m.profile_name ?? "Unknown");
              const ts = new Date(m.timestamp).toLocaleString();
              const text = (m.text ?? "").trim().replace(/\s+/g, " ");
              return `[${ts}] ${sender}: ${text}`;
            });
          }
        }

        // Build classification prompt
        const classificationResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0, // deterministic
          messages: [
            {
              role: "system",
              content:
                "You are a strict classifier that decides if a proposed message belongs in a thread. " +
                "Respond with EXACTLY one of the two words: ON_TOPIC or OFF_TOPIC. No other text.",
            },
            {
              role: "user",
              content: `Thread Topic: ${
                threadTopic ?? "None"
              }\n\nRecent Messages (chronological):\n${
                recent.length ? recent.join("\n") : "None"
              }\n\nProposed Message:\n${message}`,
            },
          ],
        });

        const verdict = classificationResponse.choices[0]?.message?.content
          ?.trim()
          .toUpperCase();

        if (verdict === "OFF_TOPIC") {
          return new Response(
            JSON.stringify({ ok: false, reason: "off_topic" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        // Any other result (including undefined) is treated as ON_TOPIC
      } catch (classificationErr) {
        // Log but do not block the rewrite flow
        console.error(
          "Classification skipped due to error:",
          classificationErr,
        );
      }
    }

    // MESSAGE REWRITE (previous behaviour, tone-aware)
    let systemPrompt =
      "You are a helpful assistant that rephrases messages to be kinder and more constructive.";

    switch (tone) {
      case "professional":
        systemPrompt =
          "You are an assistant that rephrases messages to sound professional, clear, and business-like while maintaining the original meaning.";
        break;
      case "casual":
        systemPrompt =
          "You are an assistant that rephrases messages to sound casual, relaxed, and conversational while maintaining the original meaning.";
        break;
      case "formal":
        systemPrompt =
          "You are an assistant that rephrases messages to sound formal, structured, and precise while maintaining the original meaning.";
        break;
      case "encouraging":
        systemPrompt =
          "You are an assistant that rephrases messages to sound positive, motivating, and supportive while maintaining the original meaning.";
        break;
      case "friendly":
      default:
        systemPrompt =
          "You are an assistant that rephrases messages to sound warm, friendly, and approachable while maintaining the original meaning.";
        break;
    }

    const rewriteResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `${systemPrompt} Keep responses very concise and similar in length to the original message.`,
        },
        { role: "user", content: `Rephrase this message: ${message}` },
      ],
    });

    const rephrased =
      rewriteResponse.choices[0]?.message?.content?.trim() ?? message;

    return new Response(JSON.stringify({ ok: true, text: rephrased }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error reviewing message:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        reason: error instanceof Error ? error.message : "Unexpected error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
