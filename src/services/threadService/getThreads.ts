
import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/thread";

export const getThreads = async (): Promise<Thread[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return [];
    }
    
    // Get all threads the user participates in
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false });

    if (threadError) {
      console.error("Error fetching threads:", threadError);
      return [];
    }

    // For each thread, get the participants
    const threadsWithParticipants = await Promise.all((threadData || []).map(async (thread) => {
      // Get participant profiles for this thread
      const { data: participantsData } = await supabase
        .from('thread_participants')
        .select(`
          profiles:profile_id (
            id, name
          )
        `)
        .eq('thread_id', thread.id);
      
      // Extract participant names
      const participants = participantsData?.map(item => item.profiles?.name) || [];
      
      return {
        id: thread.id,
        title: thread.title,
        createdAt: new Date(thread.created_at),
        participants: participants.filter(Boolean) as string[],
        status: thread.status,
        summary: thread.summary,
        closeRequestedBy: thread.close_requested_by,
        owner_id: thread.owner_id
      };
    }));

    return threadsWithParticipants;
  } catch (error) {
    console.error("Exception fetching threads:", error);
    return [];
  }
};
