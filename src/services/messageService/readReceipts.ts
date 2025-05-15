import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { handleError } from "./utils.js";
import type { ReadReceipt } from "./types.js";

// Cache for unread message count promises
const unreadCountCache = new Map<string, Promise<number>>();

export const createReadReceipts = async (
  messageId: string,
  threadId: string,
  senderProfileId?: string,
): Promise<void> => {
  try {
    const query = supabase
      .from("thread_participants")
      .select("profile_id")
      .eq("thread_id", threadId);

    if (senderProfileId) {
      query.neq("profile_id", senderProfileId);
    }

    const { data: participants, error: participantsError } = await query;

    if (participantsError || !participants) {
      console.error("Error fetching thread participants:", participantsError);
      return;
    }

    const readReceipts: ReadReceipt[] = participants.map(({ profile_id }) => ({
      message_id: messageId,
      profile_id,
      read_at: null,
    }));

    if (senderProfileId) {
      readReceipts.push({
        message_id: messageId,
        profile_id: senderProfileId,
        read_at: new Date().toISOString(),
      });
    }

    if (readReceipts.length > 0) {
      const { error } = await supabase
        .from("message_read_receipts")
        .insert(readReceipts);

      if (error) {
        console.error("Error creating read receipts:", error);
      }
    }
  } catch (error) {
    console.error("Exception creating read receipts:", error);
  }
};

export const markMessagesAsRead = async (
  messageIds: string[],
): Promise<boolean> => {
  try {
    if (!messageIds.length) return true;

    const user = await requireCurrentUser();
    const readReceipts: ReadReceipt[] = messageIds.map((messageId) => ({
      message_id: messageId,
      profile_id: user.id,
      read_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("message_read_receipts")
      .upsert(readReceipts, {
        onConflict: "message_id,profile_id",
        ignoreDuplicates: false,
      });

    if (error) {
      return handleError(error, "marking messages as read");
    }

    return true;
  } catch (error) {
    return handleError(error, "marking messages as read");
  }
};

export const getUnreadMessageCount = async (
  threadId: string,
): Promise<number> => {
  const cachedPromise = unreadCountCache.get(threadId);
  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = (async () => {
    try {
      const user = await requireCurrentUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_profile_id, is_system")
        .eq("thread_id", threadId)
        .neq("sender_profile_id", user.id)
        .eq("is_system", false);

      if (error || !data?.length) return 0;

      const { data: readReceipts, error: readReceiptsError } = await supabase
        .from("message_read_receipts")
        .select("message_id, read_at")
        .eq("profile_id", user.id)
        .not("read_at", "is", null);

      if (readReceiptsError) return 0;

      const readMessageIds = new Set(
        (readReceipts || []).map((receipt) => receipt.message_id),
      );

      return data.filter((message) => !readMessageIds.has(message.id)).length;
    } catch (error) {
      return handleError(error, "getting unread count") ? 0 : 0;
    } finally {
      unreadCountCache.delete(threadId);
    }
  })();

  unreadCountCache.set(threadId, promise);
  return promise;
};

export const getAllUnreadCounts = async (): Promise<Record<string, number>> => {
  try {
    const user = await requireCurrentUser();
    if (!user) return {};

    const { data: unreadMessages, error } = await supabase
      .from("message_read_receipts")
      .select(
        `
        message_id,
        messages!inner (
          thread_id,
          sender_profile_id,
          is_system
        )
      `,
      )
      .eq("profile_id", user.id)
      .is("read_at", null)
      .neq("messages.sender_profile_id", user.id)
      .eq("messages.is_system", false);

    if (error) {
      return handleError(error, "fetching all unread counts") ? {} : {};
    }

    return (unreadMessages || []).reduce(
      (counts, { messages }) => {
        const threadId = messages.thread_id;
        counts[threadId] = (counts[threadId] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );
  } catch (error) {
    return handleError(error, "fetching all unread counts") ? {} : {};
  }
};
