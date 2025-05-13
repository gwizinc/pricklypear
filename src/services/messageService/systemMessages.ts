import { supabase } from "@/integrations/supabase/client";
import { sanitizeText } from "@/utils/sanitizeText";
import { handleError } from "./utils.js";
import { getOrCreateSystemProfile } from "./utils.js";
import { createReadReceipts } from "./readReceipts.js";

export const saveSystemMessage = async (
  text: string,
  threadId: string,
): Promise<boolean> => {
  try {
    if (!text || !threadId) {
      console.error("Missing required fields for system message", {
        text,
        threadId,
      });
      return false;
    }

    const systemProfileId = await getOrCreateSystemProfile();
    if (!systemProfileId) return false;

    const sanitizedText = sanitizeText(text);
    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        text: sanitizedText,
        sender_profile_id: systemProfileId,
        conversation_id: threadId,
        timestamp: new Date().toISOString(),
        is_system: true,
      })
      .select("id")
      .single();

    if (error) {
      return handleError(error, "saving system message");
    }

    if (messageData?.id) {
      await createReadReceipts(messageData.id, threadId);
    }

    return true;
  } catch (error) {
    return handleError(error, "saving system message");
  }
};
