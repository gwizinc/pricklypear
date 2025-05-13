import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/thread";
import { requireCurrentUser } from "@/utils/authCache";

export const getThreads = async (): Promise<Thread[]> => {
  try {
    const user = await requireCurrentUser();

    // Get all threads the user participates in
    const { data: threadData, error: threadError } = await supabase
      .from("threads")
      .select("*")
      .order("created_at", { ascending: false });

    if (threadError) {
      console.error("Error fetching threads:", threadError);
      return [];
    }

    // For each thread, get the participants
    const threadsWithParticipants = await Promise.all(
      (threadData || []).map(async (thread) => {
        // Get participant profiles for this thread
        const { data: participantsData } = await supabase
          .from("thread_participants")
          .select(
            `
          profiles:profile_id (
            id, name
          )
        `,
          )
          .eq("thread_id", thread.id);

        // Extract participant names, excluding current user
        const participants =
          participantsData
            ?.map((item) => ({
              id: item.profiles?.id,
              name: item.profiles?.name,
            }))
            .filter(
              (participant) =>
                participant.id &&
                participant.name &&
                participant.id !== user.id,
            )
            .map((participant) => participant.name) || [];

        return {
          id: thread.id,
          title: thread.title,
          createdAt: new Date(thread.created_at),
          participants: participants.filter(Boolean) as string[],
          status: thread.status,
          summary: thread.summary,
          closeRequestedBy: thread.close_requested_by,
          owner_id: thread.owner_id,
          topic: thread.topic || "other", // Ensure topic is properly mapped
        };
      }),
    );

    return threadsWithParticipants;
  } catch (error) {
    console.error("Exception fetching threads:", error);
    return [];
  }
};
