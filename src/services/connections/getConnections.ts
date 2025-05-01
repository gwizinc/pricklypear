
import { supabase } from "@/integrations/supabase/client";
import { Connection, ConnectionStatus } from "@/types/connection";

// Get all connections for the current user
export const getConnections = async (): Promise<Connection[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const userId = userData.user.id;

    // Get connections where the user is the sender only (user_id equals current user)
    const { data: connections, error } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    // Format the connections to include necessary information
    const formattedConnections = await Promise.all(
      (connections || []).map(async (connection) => {
        // Since we're only getting connections where the user is the sender,
        // the other user is always the connected_user_id
        const otherUserId = connection.connected_user_id;

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
          username: otherUserData?.name || "User Name Not Found",
          avatarUrl: undefined,
          status: connection.status as ConnectionStatus,
          createdAt: connection.created_at,
          updatedAt: connection.updated_at,
          isUserSender: true, // Always true since we're only getting connections where the user is the sender
        };
      })
    );

    return formattedConnections;
  } catch (error) {
    console.error("Error getting connections:", error);
    return [];
  }
};
