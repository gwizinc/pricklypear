
import { supabase } from "@/integrations/supabase/client";

export const updateThreadSummary = async (threadId: string, summary: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('threads')
      .update({ summary })
      .eq('id', threadId);

    if (error) {
      console.error("Error updating thread summary:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception updating thread summary:", error);
    return false;
  }
};
