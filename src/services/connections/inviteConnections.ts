
import { supabase } from "@/integrations/supabase/client";
import { InviteResponse } from "@/types/connection";

// Send email invitation to connect
export const inviteByEmail = async (email: string): Promise<InviteResponse> => {
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

    // Check for existing connections - using separate queries to avoid complex type instantiation
    
    // First check where current user is the sender
    const { data: existingSenderConnection, error: senderError } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("connected_user_id", invitedUserData.id)
      .maybeSingle();
      
    if (senderError) {
      console.error("Error checking for existing connection as sender:", senderError);
      return { success: false, message: "Error processing invitation" };
    }
    
    // Then check where current user is the receiver
    const { data: existingReceiverConnection, error: receiverError } = await supabase
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
    if (existingSenderConnection || existingReceiverConnection) {
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
