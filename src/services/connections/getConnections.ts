import { supabase } from "@/integrations/supabase/client";
import { Connection, ConnectionStatus } from "@/types/connection";
import { requireCurrentUser } from "@/utils/authCache";

// Get all connections for the current user (both as sender and receiver)
export const getConnections = async (): Promise<Connection[]> => {
  try {
    const user = await requireCurrentUser();

    const userId = user.id;

    // Get connections where the user is the sender (user_id equals current user)
    const { data: sentConnections, error: sentError } = await supabase
      .from("connections")
      .select("*")
      .eq("user_id", userId);

    if (sentError) throw sentError;

    // Get connections where the user is the receiver (connected_user_id equals current user)
    const { data: receivedConnections, error: receivedError } = await supabase
      .from("connections")
      .select("*")
      .eq("connected_user_id", userId);

    if (receivedError) throw receivedError;

    // Combined connections
    const allConnections = [
      ...(sentConnections || []),
      ...(receivedConnections || []),
    ];

    // Format the connections to include necessary information
    const formattedConnections = await Promise.all(
      allConnections.map(async (connection) => {
        // Determine if the current user is the sender
        const isUserSender = connection.user_id === userId;

        // Get ID of the other user in the connection
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

        if (!otherUserData) {
          throw new Error("RLS issue. User was not able to be selected.");
        }

        return {
          id: connection.id,
          otherUserId,
          username: otherUserData.name,
          avatarUrl: undefined,
          status: connection.status as ConnectionStatus,
          createdAt: connection.created_at,
          updatedAt: connection.updated_at,
          isUserSender, // Now correctly indicates if the user is the sender or receiver
        };
      }),
    );

    return formattedConnections;
  } catch (error) {
    console.error("Error getting connections:", error);
    return [];
  }
};
