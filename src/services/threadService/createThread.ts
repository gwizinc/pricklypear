import { supabase } from "@/integrations/supabase/client";
import { Thread, ThreadStatus } from "@/types/thread";
import type { ThreadTopic } from "@/constants/thread-topics";
import { requireCurrentUser } from "@/utils/authCache";

export const createThread = async (
  title: string,
  participantIds: string[],
  topic: ThreadTopic = "other",
): Promise<Thread | null> => {
  try {
    const user = await requireCurrentUser();

    // Build default summary so it is available immediately after creation
    const userName =
      (user.user_metadata?.name as string | undefined)?.trim() || user.email;
    const summary = `New thread created by ${userName}`;

    // Call the database function to create the thread and add participants.
    // The backend function has been updated to accept `summary` so we can
    // persist it in the same INSERT operation.
    const { data: threadId, error: threadError } = await supabase.rpc(
      "create_thread",
      {
        title,
        topic,
        participant_ids: participantIds,
        summary,
      },
    );

    if (threadError || !threadId) {
      console.error("Error creating thread:", threadError);
      return null;
    }

    // No additional update call needed; summary is already saved.

    // Return the thread with participant names
    return {
      id: threadId,
      title,
      createdAt: new Date(),
      status: "open" as ThreadStatus,
      participants: participantIds,
      summary,
      topic,
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    return null;
  }
};
