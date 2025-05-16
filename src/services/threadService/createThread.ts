import { supabase } from "@/integrations/supabase/client";
import { Thread, ThreadStatus } from "@/types/thread";
import type { ThreadTopic } from "@/constants/thread-topics";
import { requireCurrentUser } from "@/utils/authCache";

export const createThread = async (
  title: string,
  participantIds: string[],
  topic: ThreadTopic = "other",
): Promise<Thread | null> => {
  // DD-55: guard at service layer as a final back-stop
  if (title.trim().length > 50) {
    console.error("createThread aborted: title exceeds 50 characters");
    return null;
  }
  try {
    const user = await requireCurrentUser();

    // Call the database function to create the thread and add participants
    const { data: threadId, error: threadError } = await supabase.rpc(
      "create_thread",
      {
        title,
        topic,
        participant_ids: participantIds,
      },
    );

    if (threadError || !threadId) {
      console.error("Error creating thread:", threadError);
      return null;
    }

    // Return the thread with participant names
    return {
      id: threadId,
      title,
      createdAt: new Date(),
      status: "open" as ThreadStatus,
      participants: participantIds,
      summary: null,
      topic,
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    return null;
  }
};
