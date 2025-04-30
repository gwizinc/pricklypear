
import { supabase } from "@/integrations/supabase/client";

// Define types based on actual database schema
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface Connection {
  id: string;
  otherUserId: string;
  username: string;
  avatarUrl?: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  isUserSender: boolean;
}

// Get all connections for the current user
export const getConnections = async (): Promise<Connection[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const userId = userData.user.id;

    // Get connections where the user is either the sender or receiver
    const { data: connections, error } = await supabase
      .from("connections")
      .select("*")
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);

    if (error) throw error;

    // Format the connections to include necessary information
    const formattedConnections = await Promise.all(
      (connections || []).map(async (connection) => {
        // Determine if the current user is the sender or receiver
        const isUserSender = connection.user_id === userId;
        const otherUserId = isUserSender
          ? connection.connected_user_id
          : connection.user_id;

        // Get the other user's details
        const { data: otherUserData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", otherUserId)
          .single();

        return {
          id: connection.id,
          otherUserId,
          username: otherUserData?.username || "Unknown User",
          avatarUrl: undefined, // profile doesn't have avatar_url field based on error
          status: connection.status as ConnectionStatus,
          createdAt: connection.created_at,
          updatedAt: connection.updated_at,
          isUserSender,
        };
      })
    );

    return formattedConnections;
  } catch (error) {
    console.error("Error getting connections:", error);
    return [];
  }
};

// Update the status of a connection
export const updateConnectionStatus = async (
  connectionId: string,
  status: ConnectionStatus
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("connections")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", connectionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating connection status:", error);
    return false;
  }
};

// Delete a connection
export const deleteConnection = async (connectionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting connection:", error);
    return false;
  }
};

// Send email invitation to connect
export const inviteByEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { success: false, message: "You must be logged in to invite connections" };
    }

    // Check if user is trying to invite themselves
    if (email === userData.user.email) {
      return { success: false, message: "You cannot invite yourself" };
    }

    // Check if the invited user exists in the system
    const { data: invitedUserData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Error checking for invited user:", userError);
      return { success: false, message: "Error processing invitation" };
    }

    if (!invitedUserData) {
      // No user found with this email
      return { 
        success: false, 
        message: "No user found with this email address. They need to register first."
      };
    }

    // Simplified query to avoid complex type instantiation
    // Check if a connection already exists where current user is sender
    const { data: existingConnectionAsSender, error: senderError } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("connected_user_id", invitedUserData.id)
      .maybeSingle();
      
    if (senderError) {
      console.error("Error checking for existing connection as sender:", senderError);
      return { success: false, message: "Error processing invitation" };
    }
    
    // Check if a connection already exists where current user is receiver
    const { data: existingConnectionAsReceiver, error: receiverError } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", invitedUserData.id)
      .eq("connected_user_id", userData.user.id)
      .maybeSingle();
    
    if (receiverError) {
      console.error("Error checking for existing connection as receiver:", receiverError);
      return { success: false, message: "Error processing invitation" };
    }

    // If connection exists in either direction
    if (existingConnectionAsSender || existingConnectionAsReceiver) {
      return { success: false, message: "A connection with this user already exists" };
    }

    // Create the new connection
    const { error: createError } = await supabase
      .from("connections")
      .insert({
        user_id: userData.user.id,
        connected_user_id: invitedUserData.id,
        status: "pending",
      });

    if (createError) {
      console.error("Error creating connection:", createError);
      return { success: false, message: "Failed to send invitation" };
    }

    return { success: true, message: "Invitation sent successfully" };
  } catch (error) {
    console.error("Error inviting by email:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
};

// This function is renamed for reference purposes - searchUsers is no longer needed
// Function is now replaced by inviteByEmail
export const searchUsers = async (query: string): Promise<{ id: string; username: string }[]> => {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) return [];
  
  // Search for users by username
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", `%${query}%`)
    .neq("id", currentUser.user.id)
    .limit(10);
  
  if (error) {
    console.error("Error searching users:", error);
    return [];
  }
  
  return data || [];
};
