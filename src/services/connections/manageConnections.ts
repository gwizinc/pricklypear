
import { supabase } from "@/integrations/supabase/client";
import { ConnectionStatus } from "@/types/connection";

// Update the status of a connection
export const updateConnectionStatus = async (
  connectionId: string,
  status: ConnectionStatus
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("connections")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", connectionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating connection status:", error);
    return false;
  }
};

// Delete a connection
export const deleteConnection = async (connectionId: string): Promise<boolean> => {
  try {
    // First get the connection details to check if it exists
    const { data: connectionData, error: fetchError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (fetchError) {
      console.error("Error fetching connection:", fetchError);
      return false;
    }

    if (!connectionData) {
      console.error("Connection not found");
      return false;
    }

    // Delete the connection
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      console.error("Error deleting connection:", error);
      throw error;
    }
    
    console.log("Connection successfully deleted:", connectionId);
    return true;
  } catch (error) {
    console.error("Error deleting connection:", error);
    return false;
  }
};
