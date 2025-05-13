import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";

// Import connection types from types/connection.ts
import { ConnectionStatus, Connection, InviteResponse } from '@/types/connection';

// Import functions from the connections directory
import { 
  getConnections, 
  updateConnectionStatus, 
  disableConnection, 
  inviteByEmail 
} from './connections';

// Re-export all connection-related functions and types
export { 
  getConnections, 
  updateConnectionStatus, 
  disableConnection, 
  inviteByEmail, 
  type ConnectionStatus,
  type Connection, 
  type InviteResponse 
};

// This function is updated to work with the new profile-based sender structure
export const searchUsers = async (query: string): Promise<{ id: string; username: string }[]> => {
  const user = await requireCurrentUser();
  
  // Search for users by username
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .ilike("name", `%${query}%`)
    .neq("id", user.id)
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
