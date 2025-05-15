import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/thread";
import { requireCurrentUser } from "@/utils/authCache";

export const getThread = async (threadId: string): Promise<Thread | null> => {
  try {
    // Get the current authenticated user
    const user = await requireCurrentUser();

    // Get the thread
    const { data: threadData, error: threadError } = await supabase
      .from("threads")
      .select("*")
      .eq("id", threadId)
      .single();

    if (threadError) {
      console.error("Error fetching thread:", threadError);
      return null;
    }

    // Get participants for this thread
    const { data: participantsData, error: participantsError } = await supabase
      .from("thread_participants")
      .select(
        `
        profiles:user_id (
          id, name
        )
      `,
      )
      .eq("thread_id", threadId);

    if (participantsError) {
      console.error("Error fetching thread participants:", participantsError);
    }

    // Extract participant names, excluding the current user
    const participants = participantsData
      ?.filter((item) => item.profiles?.id !== user.id)
      .map((item) => ({
        id: item.profiles?.id,
        name: item.profiles?.name,
      }))
      .filter((participant) => participant.name) // Filter out undefined names
      .map((participant) => participant.name);

    return {
      id: threadData.id,
      title: threadData.title,
      createdAt: new Date(threadData.created_at),
      participants: participants || [],
      summary: threadData.summary,
      topic: threadData.topic,
    };
  } catch (error) {
    console.error("Exception fetching thread:", error);
    return null;
  }
};
