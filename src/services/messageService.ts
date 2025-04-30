
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message";
import { v4 as uuidv4 } from "uuid";

export const saveMessage = async (
  sender: string, 
  original: string, 
  kind: string, 
  selected: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: uuidv4(),
        sender,
        original_text: original,
        kind_text: kind,
        selected_text: selected,
        timestamp: new Date()
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

export const getMessages = async (): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });

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
      kind_text: msg.kind_text
    }));
  } catch (error) {
    console.error("Exception fetching messages:", error);
    return [];
  }
};
