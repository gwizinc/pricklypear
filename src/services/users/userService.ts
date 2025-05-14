import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";

import {
  ConnectionStatus,
  Connection,
  InviteResponse,
} from "@/types/connection";

/*
 * Re-export the connection helpers from this (now users) namespace so that the
 * rest of the app has a single import surface.
 *
 * NOTE: All helpers live in the same directory; therefore `"."` is the correct
 * path (instead of `"./connections"` that was used previously).
 */
export {
  getConnections,
  updateConnectionStatus,
  disableConnection,
  inviteByEmail,
  type ConnectionStatus,
  type Connection,
  type InviteResponse,
} from ".";

/**
 * Search profiles by (case-insensitive) name while excluding the current user.
 *
 * @param {string} query  Partial name / email to search for
 * @returns List of matching profile id + username tuples
 */
export const searchUsers = async (
  query: string,
): Promise<{ id: string; username: string }[]> => {
  const user = await requireCurrentUser();

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

  return (data ?? []).map(({ id, name }) => ({
    id,
    username: name ?? "",
  }));
};
