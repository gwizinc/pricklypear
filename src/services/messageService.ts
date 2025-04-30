
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message";
import { v4 as uuidv4 } from "uuid";

export const saveMessage = async (
  sender: string, 
  original: string, 
  kind: string, 
  selected: string,
  threadId?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender,
        original_text: original,
        kind_text: kind,
        selected_text: selected,
        conversation_id: threadId,
        // Convert Date to ISO string to match the expected string type
        timestamp: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error("Error saving message:", error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error("Exception saving message:", error);
    return null;
  }
};

export const getMessages = async (threadId?: string): Promise<Message[]> => {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });
    
    // If a threadId is provided, filter messages for that thread
    if (threadId) {
      query = query.eq('conversation_id', threadId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return (data || []).map(msg => ({
      id: msg.id,
      text: msg.selected_text,
      sender: msg.sender,
      timestamp: new Date(msg.timestamp),
      original_text: msg.original_text,
      kind_text: msg.kind_text,
      threadId: msg.conversation_id
    }));
  } catch (error) {
    console.error("Exception fetching messages:", error);
    return [];
  }
};
