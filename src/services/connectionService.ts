import { supabase } from "@/integrations/supabase/client";

// Re-export all connection-related functions and types from the new structure
export {
  getConnections,
  updateConnectionStatus,
  deleteConnection,
  inviteByEmail,
  type ConnectionStatus,
  type Connection,
  type InviteResponse
} from './connections';

// This function is no longer used but kept for reference
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
