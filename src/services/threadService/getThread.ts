
import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/thread";

export const getThread = async (threadId: string): Promise<Thread | null> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
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
    const { data: participantsData, error: participantsError } = await supabase
      .from('thread_participants')
      .select(`
        profiles:profile_id (
          id, name
        )
      `)
      .eq('thread_id', threadId);
    
    if (participantsError) {
      console.error("Error fetching thread participants:", participantsError);
    }

    if (participantsData.length === 0) {
      throw new Errro("RLS issue getting thread participants. Expecting at least 1");
    }
    
    // Extract participant names, excluding the current user
    const participants = participantsData
      .map(item => ({
        id: item.profiles?.id,
        name: item.profiles?.name
      }))
      .filter(participant => participant.id !== user.id)
      .map(participant => participant.name);

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
