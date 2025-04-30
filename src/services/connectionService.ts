
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Define types for our connections
export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  connected_user?: {
    id: string;
    email: string;
    // Include any other user fields you need
  };
}

// Get all connections for the current user
export const getUserConnections = async (): Promise<Connection[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      connected_user:connected_user_id(id, email)
    `)
    .or(`user_id.eq.${user.user.id},connected_user_id.eq.${user.user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching connections:', error);
    throw new Error('Failed to fetch connections');
  }

  // Process connections to have consistent structure regardless of which side the user is on
  return data.map(conn => {
    if (conn.user_id === user.user.id) {
      // Current user initiated the connection
      return conn;
    } else {
      // The connection was initiated by someone else
      return {
        ...conn,
        // Swap the IDs so from the current user's perspective, they're always the "user_id"
        user_id: conn.connected_user_id,
        connected_user_id: conn.user_id,
        connected_user: conn.connected_user ? {
          id: conn.connected_user.id,
          email: conn.connected_user.email
        } : undefined
      };
    }
  });
};

// Create a new connection request
export const createConnectionRequest = async (connectedUserId: string): Promise<Connection> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('connections')
    .insert({
      user_id: user.user.id,
      connected_user_id: connectedUserId,
      status: 'pending'
    })
    .select(`
      *,
      connected_user:connected_user_id(id, email)
    `)
    .single();

  if (error) {
    console.error('Error creating connection request:', error);
    throw new Error('Failed to create connection request');
  }

  return data;
};

// Update a connection status
export const updateConnectionStatus = async (connectionId: string, status: 'accepted' | 'declined'): Promise<Connection> => {
  const { data, error } = await supabase
    .from('connections')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', connectionId)
    .select(`
      *,
      connected_user:connected_user_id(id, email)
    `)
    .single();

  if (error) {
    console.error('Error updating connection status:', error);
    throw new Error('Failed to update connection status');
  }

  return data;
};

// Search for users to connect with
export const searchUsers = async (query: string): Promise<User[]> => {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser?.user) {
    throw new Error('User not authenticated');
  }

  // Search for users by email
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', `%${query}%`)
    .neq('id', currentUser.user.id)
    .limit(10);

  if (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }

  return data;
};
