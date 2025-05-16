import { supabase } from "@/integrations/supabase/client";

/**
 * Upsert (thread_id,user_id) rows into `thread_participants`.
 * Duplicate pairs are ignored via the `onConflict` clause.
 *
 * @param threadId  Thread to update
 * @param userIds   Array of profile ids to add
 * @returns         `true` on success, otherwise `false`
 */
export const addParticipantsToThread = async (
  threadId: string,
  userIds: string[],
): Promise<boolean> => {
  if (userIds.length === 0) return true;

  try {
    const rows = userIds.map((userId) => ({
      thread_id: threadId,
      user_id: userId,
    }));

    const { error } = await supabase
      .from("thread_participants")
      .upsert(rows, {
        onConflict: "thread_id,user_id",
        ignoreDuplicates: true,
      });

    if (error) {
      console.error("Error adding participants:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception adding participants:", err);
    return false;
  }
};
