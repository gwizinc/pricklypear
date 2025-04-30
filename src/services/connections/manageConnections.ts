
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
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting connection:", error);
    return false;
  }
};
