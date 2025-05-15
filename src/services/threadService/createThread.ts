import { supabase } from "@/integrations/supabase/client";
import { Thread, ThreadStatus } from "@/types/thread";
import type { ThreadTopic } from "@/constants/thread-topics";
import { v4 as uuidv4 } from "uuid";
import { requireCurrentUser } from "@/utils/authCache";

export const createThread = async (
  title: string,
  participantIds: string[],
  topic: ThreadTopic = "other",
): Promise<Thread | null> => {
  try {
    const user = await requireCurrentUser();

    // Create the thread first
    const threadId = uuidv4();
    const { data: threadData, error: threadError } = await supabase
      .from("threads")
      .insert({
        id: threadId,
        title,
        created_at: new Date().toISOString(),
        status: "open" as ThreadStatus,
        summary: null,
        topic,
      })
      .select()
      .single();

    if (threadError) {
      console.error("Error creating thread:", threadError);
      return null;
    }

    // Ensure the thread creator is included in participants
    const allParticipantIds = [...new Set([...participantIds, user.id])];
    
    // Add all participants to the thread_participants table
    const participantsToInsert = allParticipantIds.map((user_id) => ({
      thread_id: threadId,
      user_id,
    }));

    const { error: participantsError } = await supabase
      .from("thread_participants")
      .insert(participantsToInsert);

    if (participantsError) {
      console.error("Error adding thread participants:", participantsError);
      return null;
    }

    // Return the thread with participant names
    return {
      id: threadData.id,
      title: threadData.title,
      createdAt: new Date(threadData.created_at),
      status: threadData.status as ThreadStatus,
      participants: allParticipantIds,
      summary: threadData.summary,
      topic: threadData.topic,
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    return null;
  }
};
