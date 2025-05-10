import { supabase } from "@/integrations/supabase/client";

export const generateThreadSummary = async (args: {threadId: string}): Promise<string | null> => {
  try {
    // Call the Supabase Edge Function to generate a summary
    const { data, error } = await supabase.functions.invoke('summarize-thread', {
      body: { threadId: args.threadId }
    });

    if (error) {
      console.error("Error calling summarize-thread function:", error);
      return null;
    }

    return data?.summary || null;
  } catch (error) {
    console.error("Exception generating thread summary:", error);
    return null;
  }
};
