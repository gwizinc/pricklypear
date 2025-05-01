
import { supabase } from "@/integrations/supabase/client";

export const requestCloseThread = async (threadId: string, requestedByProfileId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('threads')
      .update({ 
        close_requested_by: requestedByProfileId 
      })
      .eq('id', threadId);

    if (error) {
      console.error("Error requesting thread closure:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception requesting thread closure:", error);
    return false;
  }
};

export const approveCloseThread = async (threadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('threads')
      .update({ 
        status: 'closed',
        close_requested_by: null 
      })
      .eq('id', threadId);

    if (error) {
      console.error("Error closing thread:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception closing thread:", error);
    return false;
  }
};

export const rejectCloseThread = async (threadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('threads')
      .update({ 
        close_requested_by: null 
      })
      .eq('id', threadId);

    if (error) {
      console.error("Error rejecting thread closure:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception rejecting thread closure:", error);
    return false;
  }
};
