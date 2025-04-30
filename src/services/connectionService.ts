
import { supabase } from '@/integrations/supabase/client';

// Define type for connection status
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

// Define types for our connections
export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  // Include user information
  username?: string;
  email?: string;
}

// Get all connections for the current user
export const getConnections = async (): Promise<Connection[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    return [];
  }

  // Fetch connections
  const { data: connectionsData, error } = await supabase
    .from('connections')
    .select('*')
    .or(`user_id.eq.${user.user.id},connected_user_id.eq.${user.user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching connections:', error);
    throw new Error('Failed to fetch connections');
  }

  // Process connections and fetch related profile data
  const processedConnections = await Promise.all(connectionsData.map(async (conn) => {
    // Determine the ID of the other user
    const otherUserId = conn.user_id === user.user.id ? conn.connected_user_id : conn.user_id;
    
    // Fetch profile data for the other user
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', otherUserId)
      .single();
    
    // Ensure consistent structure from current user's perspective
    let connectionWithUsername: Connection;
    if (conn.user_id === user.user.id) {
      // Current user initiated the connection
      connectionWithUsername = {
        ...conn,
        status: conn.status as ConnectionStatus,
        username: profileData?.username || 'Unknown User'
      };
    } else {
      // The connection was initiated by someone else
      connectionWithUsername = {
        ...conn,
        // Swap the IDs so from the current user's perspective, they're always the "user_id"
        user_id: conn.connected_user_id,
        connected_user_id: conn.user_id,
        status: conn.status as ConnectionStatus,
        username: profileData?.username || 'Unknown User'
      };
    }
    
    return connectionWithUsername;
  }));
  
  return processedConnections;
};

// Invite a new connection by email
export const inviteByEmail = async (email: string): Promise<Connection | null> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    throw new Error('User not authenticated');
  }

  // Check if user with this email exists
  const { data: userData } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('email', email)
    .maybeSingle();

  if (!userData) {
    // If user doesn't exist, we can still create a pending invitation
    // that will be claimable when they sign up
    // For simplicity, we'll throw an error for now
    throw new Error('User with this email not found');
  }

  // Create a connection
  const { data, error } = await supabase
    .from('connections')
    .insert({
      user_id: user.user.id,
      connected_user_id: userData.id,
      status: 'pending' as ConnectionStatus
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating connection invitation:', error);
    throw new Error('Failed to create connection invitation');
  }

  return {
    ...data,
    status: data.status as ConnectionStatus,
    username: userData?.username || 'Unknown User',
    email
  };
};

// Update a connection status
export const updateConnectionStatus = async (connectionId: string, status: ConnectionStatus): Promise<Connection | null> => {
  const { data, error } = await supabase
    .from('connections')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating connection status:', error);
    throw new Error('Failed to update connection status');
  }

  // After getting the connection, fetch the profile separately
  const { data: user } = await supabase.auth.getUser();
  
  // Determine the ID of the other user
  const otherUserId = data.user_id === user?.user?.id ? data.connected_user_id : data.user_id;
  
  // Fetch profile for the other user
  const { data: profileData } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', otherUserId)
    .maybeSingle();

  return {
    ...data,
    status: data.status as ConnectionStatus,
    username: profileData?.username || 'Unknown User'
  };
};

// Delete a connection
export const deleteConnection = async (connectionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId);

  if (error) {
    console.error('Error deleting connection:', error);
    throw new Error('Failed to delete connection');
  }

  return true;
};

// This function is renamed for reference purposes - searchUsers is no longer needed
// Function is now replaced by inviteByEmail
export const searchUsers = async (query: string): Promise<{ id: string; username: string }[]> => {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser?.user) {
    throw new Error('User not authenticated');
  }

  // Search for users by username
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', `%${query}%`)
    .neq('id', currentUser.user.id)
    .limit(10);

  if (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }

  return data as { id: string; username: string }[];
};
