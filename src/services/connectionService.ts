
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  username: string; // Connected user's username
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const getConnections = async (): Promise<Connection[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return [];
    }

    // Get connections where the current user is either the initiator or receiver
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        connected_profiles:profiles!connections_connected_user_id_fkey(username)
      `)
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

    if (error) {
      console.error("Error fetching connections:", error);
      return [];
    }

    // Transform the data into our Connection type
    return (data || []).map(connection => {
      const isInitiator = connection.user_id === user.id;
      const connectedUserId = isInitiator ? connection.connected_user_id : connection.user_id;
      const connectedUsername = connection.connected_profiles?.username || 'Unknown User';

      return {
        id: connection.id,
        userId: user.id,
        connectedUserId,
        username: connectedUsername,
        status: connection.status as ConnectionStatus,
        createdAt: new Date(connection.created_at),
        updatedAt: new Date(connection.updated_at)
      };
    });
  } catch (error) {
    console.error("Exception fetching connections:", error);
    return [];
  }
};

export const createConnection = async (connectedUserId: string): Promise<Connection | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    // Don't allow connecting to yourself
    if (user.id === connectedUserId) {
      console.error("Cannot connect to yourself");
      return null;
    }

    const { data, error } = await supabase
      .from('connections')
      .insert({
        user_id: user.id,
        connected_user_id: connectedUserId,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        connected_profiles:profiles!connections_connected_user_id_fkey(username)
      `)
      .single();

    if (error) {
      console.error("Error creating connection:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      connectedUserId: data.connected_user_id,
      username: data.connected_profiles?.username || 'Unknown User',
      status: data.status as ConnectionStatus,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error("Exception creating connection:", error);
    return null;
  }
};

export const updateConnectionStatus = async (connectionId: string, status: ConnectionStatus): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }

    const { error } = await supabase
      .from('connections')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

    if (error) {
      console.error("Error updating connection status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception updating connection status:", error);
    return false;
  }
};

export const deleteConnection = async (connectionId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }

    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

    if (error) {
      console.error("Error deleting connection:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception deleting connection:", error);
    return false;
  }
};

export const searchUsers = async (query: string): Promise<{ id: string; username: string }[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${query}%`)
      .neq('id', user.id) // Don't show the current user
      .limit(10);

    if (error) {
      console.error("Error searching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception searching users:", error);
    return [];
  }
};
