
import { supabase } from "@/integrations/supabase/client";

export async function reviewMessage(message: string): Promise<string> {
  try {
    // Call the Supabase Edge Function instead of directly calling OpenAI
    const { data, error } = await supabase.functions.invoke('review-message', {
      body: { message }
    });

    if (error) {
      console.error("Error calling review-message function:", error);
      return message; // Return original message if there's an error
    }

    return data?.kindMessage || message;
  } catch (error) {
    console.error("Exception reviewing message:", error);
    return message; // Return original message if there's an error
  }
}
