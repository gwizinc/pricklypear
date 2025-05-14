import { supabase } from "@/integrations/supabase/client";
import { sanitizeText } from "@/utils/sanitizeText";
import { requireCurrentUser } from "@/utils/authCache";
import { Message } from "@/types/message";
import { handleError } from "./utils.js";
import { createReadReceipts } from "./readReceipts.js";

export const saveMessage = async (
  sender: string,
  text: string,
  threadId: string,
  selected?: string,
  kind?: string,
): Promise<boolean> => {
  try {
    if (!text || !threadId) {
      console.error("Missing required fields", { text, threadId });
      return false;
    }

    const user = await requireCurrentUser();
    const messageText = sanitizeText(selected || text);

    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        sender_profile_id: user.id,
        text: messageText,
        conversation_id: threadId,
        timestamp: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return handleError(error, "saving message");
    }

    if (messageData?.id) {
      await createReadReceipts(messageData.id, threadId, user.id);
    }

    return true;
  } catch (error) {
    return handleError(error, "saving message");
  }
};

export const getMessages = async (threadId: string): Promise<Message[]> => {
  try {
    if (!threadId) {
      console.error("ThreadId is required");
      return [];
    }

    const { data: messagesData, error: messagesError } = await supabase
      .from("message_profiles")
      .select("*")
      .eq("conversation_id", threadId)
      .order("timestamp", { ascending: true });

    if (messagesError) {
      return handleError(messagesError, "fetching messages") ? [] : [];
    }

    const user = await requireCurrentUser();

    return (messagesData || []).map((msg) => ({
      id: msg.message_id,
      // Strip legacy wrapping quotes at read-time.
      text: sanitizeText(msg.text || ""),
      sender: msg.is_system ? "system" : msg.profile_name || "Unknown User",
      timestamp: new Date(msg.timestamp || ""),
      threadId: msg.conversation_id || "",
      isSystem: Boolean(msg.is_system),
      isCurrentUser: msg.profile_id === user?.id,
    }));
  } catch (error) {
    return handleError(error, "fetching messages") ? [] : [];
  }
};
