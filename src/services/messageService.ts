import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message";
import { v4 as uuidv4 } from "uuid";

export const saveMessage = async (
  sender: string, 
  original: string, 
  kind: string, 
  selected: string,
  threadId: string
): Promise<string | null> => {
  try {
    if (!threadId) {
      console.error("Thread ID is required");
      return null;
    }

    // Check if sender exists in the database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', sender)
      .single();

    if (profileError || !profileData) {
      console.error("Sender does not exist in the database:", profileError || "No profile found");
      return null;
    }

    // Proceed with saving the message since the user exists
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

export const getMessages = async (threadId: string): Promise<Message[]> => {
  try {
    if (!threadId) {
      console.error("Thread ID is required");
      return [];
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', threadId)
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
      kind_text: msg.kind_text,
      threadId: msg.conversation_id
    }));
  } catch (error) {
    console.error("Exception fetching messages:", error);
    return [];
  }
};

export const saveSystemMessage = async (
  text: string,
  threadId: string
): Promise<string | null> => {
  try {
    if (!threadId) {
      console.error("Thread ID is required");
      return null;
    }

    // System messages don't need actual users
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender: 'system',
        original_text: text,
        kind_text: text,
        selected_text: text,
        conversation_id: threadId,
        timestamp: new Date().toISOString(),
        is_system: true
      })
      .select();

    if (error) {
      console.error("Error saving system message:", error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error("Exception saving system message:", error);
    return null;
  }
};
