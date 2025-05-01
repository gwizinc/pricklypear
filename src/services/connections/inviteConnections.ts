
import { supabase } from "@/integrations/supabase/client";
import { Connection, ConnectionStatus, InviteResponse } from "@/types/connection";

// Function to send an invitation by email
export const inviteByEmail = async (email: string): Promise<InviteResponse> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { 
        success: false, 
        message: "User not authenticated" 
      };
    }
    
    const userId = userData.user.id;
    
    // Get the user by email - we need to query the profiles table
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("name", email)
      .maybeSingle();
      
    if (usersError || !users) {
      console.error("Error finding user:", usersError);
      return { 
        success: false, 
        message: "User not found with that email" 
      };
    }
    
    const invitedUser = users;
    
    // Check if there's already a connection in either direction
    const { data: existingConnection1, error: connError1 } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", userId)
      .eq("connected_user_id", invitedUser.id)
      .maybeSingle();
      
    if (connError1) {
      console.error("Error checking existing connections:", connError1);
    }
      
    const { data: existingConnection2, error: connError2 } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", invitedUser.id)
      .eq("connected_user_id", userId)
      .maybeSingle();
    
    if (connError2) {
      console.error("Error checking existing connections:", connError2);
    }
    
    if (existingConnection1 || existingConnection2) {
      return { 
        success: false, 
        message: "Connection already exists" 
      };
    }
    
    // Create a new connection
    const { data: connection, error: connectionError } = await supabase
      .from("connections")
      .insert({
        user_id: userId,
        connected_user_id: invitedUser.id,
        status: "pending"
      })
      .select()
      .single();
    
    if (connectionError) {
      console.error("Error creating connection:", connectionError);
      return { 
        success: false, 
        message: connectionError.message 
      };
    }
    
    return { 
      success: true,
      message: `Connection request sent to ${invitedUser.name}`,
      connection: {
        id: connection.id,
        otherUserId: invitedUser.id,
        username: invitedUser.name || "Unknown User",
        avatarUrl: undefined,
        status: connection.status as ConnectionStatus,
        createdAt: connection.created_at,
        updatedAt: connection.updated_at,
        isUserSender: true
      } 
    };
  } catch (error) {
    console.error("Error inviting user:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { 
      success: false, 
      message: errorMessage,
      error: error as Error 
    };
  }
};
