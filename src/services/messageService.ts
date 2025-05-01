
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

    // Get the profile ID for the sender - using maybeSingle instead of single
    // and properly handling the case where no profile is found
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', sender)
      .maybeSingle();

    if (profileError) {
      console.error("Error getting profile for sender", profileError);
      return false;
    }
    
    if (!profileData) {
      console.error(`No profile found for sender: ${sender}`);
      
      // Try to create a profile for this sender
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(), // Generate a random UUID
          name: sender
        })
        .select('id')
        .single();
      
      if (createError || !newProfile) {
        console.error("Failed to create profile for sender:", createError);
        return false;
      }
      
      // Use the newly created profile ID
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_profile_id: newProfile.id,
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
    } else {
      // Insert the message with the existing profile ID
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_profile_id: profileData.id,
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

    // Transform database records into Message objects
    return (messagesData || []).map(msg => {
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
        isSystem: Boolean(msg.is_system)
      };
    });
  } catch (error) {
    console.error("Exception fetching messages:", error);
    return [];
  }
};
