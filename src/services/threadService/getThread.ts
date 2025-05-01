
import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/thread";

export const getThread = async (threadId: string): Promise<Thread | null> => {
  try {
    // Get the thread
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (threadError) {
      console.error("Error fetching thread:", threadError);
      return null;
    }

    // Get participants for this thread
    const { data: participantsData } = await supabase
      .from('thread_participants')
      .select(`
        profiles:profile_id (
          id, name
        )
      `)
      .eq('thread_id', threadId);
    
    // Extract participant names
    const participants = participantsData?.map(item => item.profiles?.name).filter(Boolean) || [];

    return {
      id: threadData.id,
      title: threadData.title,
      createdAt: new Date(threadData.created_at),
      participants: participants as string[],
      status: threadData.status,
      summary: threadData.summary,
      closeRequestedBy: threadData.close_requested_by,
      owner_id: threadData.owner_id
    };
  } catch (error) {
    console.error("Exception fetching thread:", error);
    return null;
  }
};
