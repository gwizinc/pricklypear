
import { supabase } from "@/integrations/supabase/client";

// Re-export all connection-related functions and types from the new structure
export {
  getConnections,
  updateConnectionStatus,
  deleteConnection,
  disableConnection,
  inviteByEmail,
  type ConnectionStatus,
  type Connection,
  type InviteResponse
} from './connections';

// This function is updated to work with the new profile-based sender structure
export const searchUsers = async (query: string): Promise<{ id: string; username: string }[]> => {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) return [];
  
  // Search for users by username
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .ilike("name", `%${query}%`)
    .neq("id", currentUser.user.id)
    .limit(10);
  
  if (error) {
    console.error("Error searching users:", error);
    return [];
  }
  
  // Map the 'name' field to 'username' in the returned data to maintain API compatibility
  return (data || []).map(item => ({
    id: item.id,
    username: item.name || ''
  }));
};
