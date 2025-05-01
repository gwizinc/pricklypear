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
    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        sender_profile_id: user.id, // Use authenticated user ID directly
        original_text: text,
        kind_text: kind || text,
        selected_text: selected || text,
        conversation_id: threadId,
        timestamp: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error saving message:", error);
      return false;
    }

    // Create read receipts for the new message
    if (messageData?.id) {
      await createReadReceiptsForNewMessage(messageData.id, threadId, user.id);
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
      const { data: messageData, error } = await supabase
        .from("messages")
        .insert({
          original_text: text,
          kind_text: text,
          selected_text: text,
          sender_profile_id: systemProfileId,
          conversation_id: threadId,
          timestamp: new Date().toISOString(),
          is_system: true
        })
        .select('id')
        .single();

      if (error) {
        console.error("Error saving system message:", error);
        return false;
      }

      // Create read receipts for all thread participants for this system message
      if (messageData?.id) {
        // Get all participants in the thread
        const { data: participants } = await supabase
          .from('thread_participants')
          .select('profile_id')
          .eq('thread_id', threadId);
        
        if (participants && participants.length > 0) {
          const readReceipts = participants.map(({ profile_id }) => ({
            message_id: messageData.id,
            profile_id,
            read_at: null // System messages start as unread
          }));

          await supabase
            .from("message_read_receipts")
            .insert(readReceipts);
        }
      }
    } else {
      // Insert the system message with the existing system profile
      const { data: messageData, error } = await supabase
        .from("messages")
        .insert({
          original_text: text,
          kind_text: text,
          selected_text: text,
          sender_profile_id: systemProfileData.id,
          conversation_id: threadId,
          timestamp: new Date().toISOString(),
          is_system: true
        })
        .select('id')
        .single();

      if (error) {
        console.error("Error saving system message:", error);
        return false;
      }

      // Create read receipts for all thread participants for this system message
      if (messageData?.id) {
        // Get all participants in the thread
        const { data: participants } = await supabase
          .from('thread_participants')
          .select('profile_id')
          .eq('thread_id', threadId);
        
        if (participants && participants.length > 0) {
          const readReceipts = participants.map(({ profile_id }) => ({
            message_id: messageData.id,
            profile_id,
            read_at: null // System messages start as unread
          }));

          await supabase
            .from("message_read_receipts")
            .insert(readReceipts);
        }
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

export const markMessagesAsRead = async (messageIds: string[]): Promise<boolean> => {
  try {
    if (!messageIds.length) return true;

    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("No authenticated user found", userError);
      return false;
    }

    // For each message ID, insert or update a read receipt
    const readReceipts = messageIds.map(messageId => ({
      message_id: messageId,
      profile_id: user.id,
      read_at: new Date().toISOString()
    }));

    // Use upsert to handle the case where a receipt already exists
    const { error } = await supabase
      .from("message_read_receipts")
      .upsert(readReceipts, {
        onConflict: 'message_id,profile_id', 
        ignoreDuplicates: false // Update if exists
      });

    if (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception marking messages as read:", error);
    return false;
  }
};

// When saving a message, create read receipts for all thread participants
const createReadReceiptsForNewMessage = async (
  messageId: string, 
  threadId: string, 
  senderProfileId: string
): Promise<void> => {
  try {
    // Get all participants in the thread except the sender
    const { data: participants, error: participantsError } = await supabase
      .from('thread_participants')
      .select('profile_id')
      .eq('thread_id', threadId)
      .neq('profile_id', senderProfileId);
    
    if (participantsError || !participants) {
      console.error("Error fetching thread participants:", participantsError);
      return;
    }

    // Create read receipt records for all other participants (unread)
    const readReceipts = participants.map(({ profile_id }) => ({
      message_id: messageId,
      profile_id,
      read_at: null // null means unread
    }));

    // Also create a read receipt for the sender (already read)
    readReceipts.push({
      message_id: messageId,
      profile_id: senderProfileId,
      read_at: new Date().toISOString() // sender has read their own message
    });

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

// New function to get unread message counts for threads
export const getUnreadMessageCount = async (threadId: string): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return 0;
    
    // Count messages where there's no read receipt or read_at is null
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', threadId)
      .neq('sender_profile_id', user.id)
      .not('is_system', 'eq', true)
      .not('id', 'in', supabase
        .from('message_read_receipts')
        .select('message_id')
        .eq('profile_id', user.id)
        .not('read_at', 'is', null)
      );

    if (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Exception getting unread count:", error);
    return 0;
  }
};

// Function to get unread counts for all threads
export const getAllUnreadCounts = async (): Promise<Record<string, number>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return {};
    
    // Get all threads the user participates in
    const { data: threadParticipations, error: threadError } = await supabase
      .from('thread_participants')
      .select('thread_id')
      .eq('profile_id', user.id);
    
    if (threadError || !threadParticipations) {
      console.error("Error fetching threads:", threadError);
      return {};
    }
    
    const unreadCounts: Record<string, number> = {};
    
    // Get unread counts for each thread (could be optimized with a single query in the future)
    await Promise.all(
      threadParticipations.map(async ({ thread_id }) => {
        const count = await getUnreadMessageCount(thread_id);
        unreadCounts[thread_id] = count;
      })
    );
    
    return unreadCounts;
  } catch (error) {
    console.error("Exception fetching all unread counts:", error);
    return {};
  }
};
