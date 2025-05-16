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

    /**
     * ------------------------------------------------------------------
     * Persist a default summary so that callers immediately see context.
     * ------------------------------------------------------------------
     */
    const userName =
      (user.user_metadata?.name as string | undefined)?.trim() || user.email;
    const summary = `New thread created by ${userName}`;

    try {
      const { error: updateError } = await supabase
        .from("threads")
        .update({ summary })
        .eq("id", threadId)
        .single();

      if (updateError) {
        console.error(
          `Failed to save default summary for thread ${threadId}:`,
          updateError,
        );
      }
    } catch (updateException) {
      // Network / unexpected runtime error
      console.error(
        `Unexpected error while saving summary for thread ${threadId}:`,
        updateException,
      );
    }

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
