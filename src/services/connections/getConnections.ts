
import { supabase } from "@/integrations/supabase/client";
import { Connection, ConnectionStatus } from "@/types/connection";

// Get all connections for the current user
export const getConnections = async (): Promise<Connection[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const userId = userData.user.id;

    // Get connections where the user is either the sender or receiver
    const { data: connections, error } = await supabase
      .from("connections")
      .select("*")
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);

    if (error) throw error;

    // Format the connections to include necessary information
    const formattedConnections = await Promise.all(
      (connections || []).map(async (connection) => {
        // Determine if the current user is the sender or receiver
        const isUserSender = connection.user_id === userId;
        const otherUserId = isUserSender
          ? connection.connected_user_id
          : connection.user_id;

        // Get the other user's details
        const { data: otherUserData, error: profileError } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", otherUserId)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        return {
          id: connection.id,
          otherUserId,
          username: otherUserData?.name || "Unknown User",
          avatarUrl: undefined,
          status: connection.status as ConnectionStatus,
          createdAt: connection.created_at,
          updatedAt: connection.updated_at,
          isUserSender,
        };
      })
    );

    return formattedConnections;
  } catch (error) {
    console.error("Error getting connections:", error);
    return [];
  }
};
