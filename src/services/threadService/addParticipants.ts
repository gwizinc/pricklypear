import { supabase } from "@/integrations/supabase/client";

/**
 * Insert additional participants into an existing thread.
 *
 * NOTE: This helper only performs the insert. It is the caller's
 * responsibility to ensure business-rules such as “no messages yet”.
 *
 * @param threadId - ID of the thread the users should be added to
 * @param participantIds - Array of user-ids that should participate
 * @returns `true` when the insert succeeds or no participants were supplied,
 *          otherwise `false`
 */
export const addParticipants = async (
  threadId: string,
  participantIds: string[],
): Promise<boolean> => {
  if (participantIds.length === 0) return true;

  try {
    const { error } = await supabase.from("thread_participants").insert(
      participantIds.map((id) => ({
        thread_id: threadId,
        // Column name corrected per schema review
        user_id: id,
      })),
    );

    if (error) {
      // eslint-disable-next-line no-console -- operational log
      console.error("Error adding participants:", error);
      return false;
    }

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console -- operational log
    console.error("Unexpected error adding participants:", err);
    return false;
  }
};
