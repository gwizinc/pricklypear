
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

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
}

// Get all connections for the current user
export const getConnections = async (): Promise<Connection[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    return [];
  }

  // Fetch connections and join with profiles to get usernames
  const { data: connectionsData, error } = await supabase
    .from('connections')
    .select(`
      *,
      profiles:connected_user_id(id, username)
    `)
    .or(`user_id.eq.${user.user.id},connected_user_id.eq.${user.user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching connections:', error);
    throw new Error('Failed to fetch connections');
  }

  // Process connections to have consistent structure and include username
  return connectionsData.map(conn => {
    let connectionWithUsername: Connection;
    
    if (conn.user_id === user.user.id) {
      // Current user initiated the connection
      connectionWithUsername = {
        ...conn,
        username: conn.profiles?.username || 'Unknown User'
      };
    } else {
      // The connection was initiated by someone else
      connectionWithUsername = {
        ...conn,
        // Swap the IDs so from the current user's perspective, they're always the "user_id"
        user_id: conn.connected_user_id,
        connected_user_id: conn.user_id,
        username: conn.profiles?.username || 'Unknown User'
      };
    }
    
    return connectionWithUsername;
  });
};

// Create a new connection request
export const createConnection = async (userId: string): Promise<Connection | null> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    throw new Error('User not authenticated');
  }

  // Get the username for the connected user
  const { data: profileData } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();

  // Insert the connection
  const { data, error } = await supabase
    .from('connections')
    .insert({
      user_id: user.user.id,
      connected_user_id: userId,
      status: 'pending'
    })
    .select(`
      *,
      profiles:connected_user_id(id, username)
    `)
    .single();

  if (error) {
    console.error('Error creating connection request:', error);
    throw new Error('Failed to create connection request');
  }

  // Return with username included
  return {
    ...data,
    username: data.profiles?.username || 'Unknown User'
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
    .select(`
      *,
      profiles:connected_user_id(id, username)
    `)
    .single();

  if (error) {
    console.error('Error updating connection status:', error);
    throw new Error('Failed to update connection status');
  }

  return {
    ...data,
    username: data.profiles?.username || 'Unknown User'
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

// Search for users to connect with
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
