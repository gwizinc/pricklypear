import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const { threadId } = await req.json();

    if (!threadId) {
      return new Response(JSON.stringify({ error: "ThreadId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch messages from the database
    const { data: messagesData, error: messagesError } = await supabase
      .from("message_profiles")
      .select("*")
      .eq("thread_id", threadId)
      .order("timestamp", { ascending: true });

    if (messagesError) {
      throw new Error(`Error fetching messages: ${messagesError.message}`);
    }

    if (!messagesData || messagesData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages found for this thread" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Format messages for OpenAI
    const conversationText = messagesData
      .map((msg) => {
        const sender = msg.is_system ? "SYSTEM" : msg.profile_name;
        const timestamp = new Date(msg.timestamp).toLocaleString();
        return `[${timestamp}] ${sender}: ${(msg.text ?? "").trim()}`;
      })
      .join("\n\n");

    // Initialize OpenAI with the API key from Supabase Secrets
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    // Generate a summary using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an assistant that summarizes conversations. The messages are provided in chronological order (oldest to newest) with timestamps. 
          
Important guidelines:
1. Pay special attention to the chronological order of messages - newer messages may contain updates or corrections to earlier information
2. If there are conflicting statements, prioritize the most recent information
3. Create a brief, concise summary (maximum 2 sentences) focusing on the main points and final outcomes
4. Ensure the summary reflects the most current state of the conversation based on the latest messages`,
        },
        {
          role: "user",
          content: `Please summarize this conversation, paying special attention to the chronological order and timestamps:\n\n${conversationText}`,
        },
      ],
      temperature: 0.7,
    });

    const summary =
      response.choices[0]?.message?.content || "No summary generated";

    // Update the thread with the new summary
    const { error: updateError } = await supabase
      .from("threads")
      .update({ summary })
      .eq("id", threadId);

    if (updateError) {
      throw new Error(`Error updating thread summary: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error summarizing thread:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
