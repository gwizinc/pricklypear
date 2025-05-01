
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message";
import { updateThreadSummary } from "./updateThreadSummary";

export const generateThreadSummary = async (threadId: string, messages: Message[]): Promise<string | null> => {
  try {
    // Call the Supabase Edge Function to generate a summary
    const { data, error } = await supabase.functions.invoke('summarize-thread', {
      body: { messages }
    });

    if (error) {
      console.error("Error calling summarize-thread function:", error);
      return null;
    }

    const summary = data?.summary;
    
    if (summary) {
      // Update the thread with the new summary
      const success = await updateThreadSummary(threadId, summary);
      
      if (!success) {
        console.error("Failed to update thread summary in the database");
        return null;
      }
      
      return summary;
    }
    
    return null;
  } catch (error) {
    console.error("Exception generating thread summary:", error);
    return null;
  }
};
