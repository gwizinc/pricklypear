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
    if (!text || !threadId) {
      console.error("Missing required fields", { text, threadId });
      return false;
    }

    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("No authenticated user found", userError);
      return false;
    }
    
    // Insert the message using the current user's ID
    const { error } = await supabase
      .from("messages")
      .insert({
        sender_profile_id: user.id, // Use authenticated user ID directly
        original_text: text,
        kind_text: kind || text,
        selected_text: selected || text,
        conversation_id: threadId,
        timestamp: new Date().toISOString()
      });

    if (error) {
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

    // Get the system profile ID
    const { data: systemProfileData, error: systemProfileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', 'system')
      .single();

    if (systemProfileError || !systemProfileData) {
      console.error("System profile not found", systemProfileError);
      
      // Generate a random UUID for the system profile
      const systemProfileId = crypto.randomUUID();
      
      // Create a system profile if it doesn't exist
      const { data: newProfileData, error: newProfileError } = await supabase
        .from('profiles')
        .insert({
          id: systemProfileId,
          name: 'system'
        })
        .select();

      if (newProfileError || !newProfileData) {
        console.error("Error creating system profile:", newProfileError);
        return false;
      }
      
      // Use the newly created system profile
      const { error } = await supabase
        .from("messages")
        .insert({
          original_text: text,
          kind_text: text,
          selected_text: text,
          sender_profile_id: systemProfileId,
          conversation_id: threadId,
          timestamp: new Date().toISOString(),
          is_system: true
        });

      if (error) {
        console.error("Error saving system message:", error);
        return false;
      }
    } else {
      // Insert the system message with the existing system profile
      const { error } = await supabase
        .from("messages")
        .insert({
          original_text: text,
          kind_text: text,
          selected_text: text,
          sender_profile_id: systemProfileData.id,
          conversation_id: threadId,
          timestamp: new Date().toISOString(),
          is_system: true
        });

      if (error) {
        console.error("Error saving system message:", error);
        return false;
      }
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

    // Use the view created in SQL migration for a simpler query
    const { data: messagesData, error: messagesError } = await supabase
      .from("message_profiles")
      .select("*")
      .eq("conversation_id", threadId)
      .order("timestamp", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return [];
    }

    // Get the current user's ID to consistently match messages
    const { data: { user } } = await supabase.auth.getUser();
    
    // Transform database records into Message objects
    return (messagesData || []).map(msg => {
      // Determine if this message is from the current user
      const isCurrentUserMessage = msg.profile_id === user?.id;
      
      // Safely handle the sender name for system messages and when profile data is available
      const senderName = msg.is_system 
        ? 'system' 
        : (msg.profile_name || 'Unknown User');

      return {
        id: msg.message_id,
        text: msg.selected_text || '',
        sender: senderName,
        timestamp: new Date(msg.timestamp || ''),
        original_text: msg.original_text || '',
        kind_text: msg.kind_text || '',
        threadId: msg.conversation_id || '',
        isSystem: Boolean(msg.is_system),
        isCurrentUser: isCurrentUserMessage
      };
    });
  } catch (error) {
    console.error("Exception fetching messages:", error);
    return [];
  }
};
