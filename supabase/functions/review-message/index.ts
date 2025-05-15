import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, tone = "friendly" } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize OpenAI with the API key from Supabase Secrets
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    // Customize the system message based on the selected tone
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            systemPrompt +
            " Keep responses very concise and similar in length to the original message.",
        },
        {
          role: "user",
          content: `Rephrase this message: ${message}`,
        },
      ],
      temperature: 0.7,
    });

    const kindMessage = response.choices[0]?.message?.content || message;

    return new Response(JSON.stringify({ kindMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error reviewing message:", error);

    return new Response(
      JSON.stringify({ error: error.message, kindMessage: null }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
