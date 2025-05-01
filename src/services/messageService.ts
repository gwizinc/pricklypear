
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message";

export const saveMessage = async (
  sender: string, 
  text: string, 
  threadId: string, 
  selected?: string, 
  kind?: string
): Promise<boolean> => {
  try {
    if (!sender || !text || !threadId) {
      console.error("Missing required fields", { sender, text, threadId });
      return false;
    }

    // Get the profile ID for the sender
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', sender)  // Updated from 'username' to 'name'
      .single();

    if (profileError || !profileData) {
      console.error("Error getting profile for sender", profileError);
      return false;
    }

    // Insert the message
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender: profileData.id,
        original_text: text,
        kind_text: kind || text, // Default to text if kind is not provided
        selected_text: selected || text, // Default to text if selected is not provided
        conversation_id: threadId,
        timestamp: new Date().toISOString()
      })
      .select();

    if (error || !data) {
      console.error("Error saving message:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception saving message:", error);
    return false;
  }
};

// Add the saveSystemMessage function to create system messages
export const saveSystemMessage = async (
  text: string,
  threadId: string
): Promise<boolean> => {
  try {
    if (!text || !threadId) {
      console.error("Missing required fields for system message", { text, threadId });
      return false;
    }

    // Insert the system message directly without profile lookup
    const { error } = await supabase
      .from("messages")
      .insert({
        original_text: text,
        kind_text: text, // Adding required field
        selected_text: text, // Use the same text for selected text
        sender: null, // Setting sender to null for system messages
        conversation_id: threadId,
        timestamp: new Date().toISOString(),
        is_system: true // Mark this as a system message
      });

    if (error) {
      console.error("Error saving system message:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception saving system message:", error);
    return false;
  }
};

export const getMessages = async (threadId: string): Promise<Message[]> => {
  try {
    if (!threadId) {
      console.error("ThreadId is required");
      return [];
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        profiles (name)
      `)
      .eq("conversation_id", threadId)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    // Transform database records into Message objects
    return (messages || []).map(msg => ({
      id: msg.id,
      text: msg.selected_text || '',
      // Handle system messages vs user messages
      sender: msg.is_system ? 'system' : (
        // For user messages, get the name from the profile
        msg.profiles && 'name' in msg.profiles ? 
          msg.profiles.name : 'Unknown Profile'
      ),
      timestamp: new Date(msg.timestamp || ''),
      original_text: msg.original_text || '',
      kind_text: msg.kind_text || '',
      threadId: msg.conversation_id || '',
      isSystem: Boolean(msg.is_system)
    }));
  } catch (error) {
    console.error("Exception fetching messages:", error);
    return [];
  }
};
