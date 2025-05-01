
import { supabase } from "@/integrations/supabase/client";

export async function reviewMessage(message: string): Promise<string> {
  try {
    // Get the user's message tone preference if authenticated
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    
    let tone = "friendly"; // Default tone
    
    if (userId) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('message_tone')
        .eq('id', userId)
        .single();
      
      if (profileData?.message_tone) {
        tone = profileData.message_tone;
      }
    }
    
    // Call the Supabase Edge Function with the user's preferred tone
    const { data, error } = await supabase.functions.invoke('review-message', {
      body: { message, tone }
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
