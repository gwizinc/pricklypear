import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { Message } from "@/types/message";
import { handleError } from "./utils.js";
import { createReadReceipts } from "./readReceipts.js";
import { getConnections } from "@/services/connections/getConnections.js";

// Cache for profile name lookups to avoid repeated database queries
const profileNameCache = new Map<string, string>();

/**
 * Looks up a profile name by ID using the user's connections.
 * First checks the cache, then queries the database if needed.
 * 
 * @param {string} profileId - The ID of the profile to look up
 * @returns {Promise<string | undefined>} The profile name if found, undefined otherwise
 */
const lookupProfileName = async (profileId: string): Promise<string | undefined> => {
  // Check cache first
  if (profileNameCache.has(profileId)) {
    return profileNameCache.get(profileId);
  }

  try {
    // Get all connections for the current user
    const connections = await getConnections();
    
    // Find the connection with matching profile ID
    const connection = connections.find(
      conn => conn.otherUserId === profileId && conn.status === "accepted"
    );

    if (connection) {
      // Cache the result
      profileNameCache.set(profileId, connection.username);
      return connection.username;
    }

    // If not found in connections, try to get directly from profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", profileId)
      .single();

    if (error || !profile) {
      return undefined;
    }

    // Cache the result
    profileNameCache.set(profileId, profile.name);
    return profile.name;
  } catch (error) {
    console.error("Error looking up profile name:", error);
    return undefined;
  }
};

export const saveMessage = async (
  text: string,
  threadId: string,
  selected?: string,
): Promise<boolean> => {
  try {
    if (!text || !threadId) {
      console.error("Missing required fields", { text, threadId });
      return false;
    }

    const user = await requireCurrentUser();
    const messageText = (selected || text).trim();

    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        text: messageText,
        thread_id: threadId,
        timestamp: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return handleError(error, "saving message");
    }

    if (messageData?.id) {
      await createReadReceipts(messageData.id, threadId, user.id);
    }

    return true;
  } catch (error) {
    return handleError(error, "saving message");
  }
};

export const getMessages = async (threadId: string): Promise<Message[]> => {
  try {
    if (!threadId) {
      console.error("ThreadId is required");
      return [];
    }

    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("timestamp", { ascending: true });

    if (messagesError) {
      return handleError(messagesError, "fetching messages") ? [] : [];
    }

    const user = await requireCurrentUser();

    // Process messages in parallel for better performance
    const messages = await Promise.all(
      (messagesData || []).map(async (msg) => ({
        id: msg.id,
        text: (msg.text || "").trim(),
        sender: msg.is_system ? "system" : await lookupProfileName(msg.user_id) || "Unknown User",
        timestamp: new Date(msg.timestamp || ""),
        threadId: msg.thread_id || "",
        isSystem: Boolean(msg.is_system),
        isCurrentUser: msg.user_id === user.id,
      }))
    );

    return messages;
  } catch (error) {
    return handleError(error, "fetching messages") ? [] : [];
  }
};
