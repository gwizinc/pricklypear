
import { supabase } from "@/integrations/supabase/client";
import { Connection, ConnectionStatus } from "@/types/connection";

export interface InviteResponse {
  connection?: Connection;
  error?: Error;
}

// Function to send an invitation by email
export const inviteByEmail = async (email: string): Promise<InviteResponse> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");
    
    const userId = userData.user.id;
    
    // Get the user by email
    const { data: invitedUser, error: invitedUserError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", (await supabase.from("auth").select("id").eq("email", email).single()).data?.id)
      .single();
    
    if (invitedUserError) throw new Error("User not found");
    
    // Check if there's already a connection in either direction
    const { data: existingConnection1 } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", userId)
      .eq("connected_user_id", invitedUser.id)
      .maybeSingle();
      
    const { data: existingConnection2 } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", invitedUser.id)
      .eq("connected_user_id", userId)
      .maybeSingle();
    
    const existingConnection = existingConnection1 || existingConnection2;
    
    if (existingConnection) {
      throw new Error("Connection already exists");
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
    
    if (connectionError) throw connectionError;
    
    return { 
      connection: {
        id: connection.id,
        otherUserId: invitedUser.id,
        username: invitedUser.username || "Unknown User",
        avatarUrl: undefined,
        status: connection.status as ConnectionStatus,
        createdAt: connection.created_at,
        updatedAt: connection.updated_at,
        isUserSender: true
      } 
    };
  } catch (error) {
    console.error("Error inviting user:", error);
    return { error: error as Error };
  }
};
