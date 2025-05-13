import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/utils/authCache";

export async function reviewMessage(message: string): Promise<string> {
  try {
    // Get the user's message tone preference if authenticated
    const user = await getCurrentUser();
    const userId = user?.id;

    let tone = "friendly"; // Default tone

    if (userId) {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("message_tone")
        .eq("id", userId)
        .maybeSingle();

      if (profileData?.message_tone && !error) {
        tone = profileData.message_tone;
      }
    }

    // Call the Supabase Edge Function with the user's preferred tone
    const { data, error } = await supabase.functions.invoke("review-message", {
      body: { message, tone },
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
