import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/message";

/*
  Service helpers for CRUD operations on `messages`.
  NOTE: The database schema no longer contains the `original_text` column, so we
  must not read from or write to it. All helpers below exclusively work with the
  remaining columns: kind_text (the AI-rephrased version) and selected_text (the
  final user-approved version that is displayed in the UI).
*/

export const saveMessage = async (
  sender: string,
  text: string, // the raw user input – *not* persisted anymore
  threadId: string,
  selected?: string,
  kind?: string
): Promise<boolean> => {
  try {
    if (!text || !threadId) {
      console.error("Missing required fields", { text, threadId })
      return false
    }

    // Get the current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("No authenticated user found", userError)
      return false
    }

    // Insert the message using the current user's ID.
    // Only `kind_text` and `selected_text` are persisted. `text` stays in memory.
    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        sender_profile_id: user.id,
        kind_text: kind || text,
        selected_text: selected || text,
        conversation_id: threadId,
        timestamp: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error saving message:", error)
      return false
    }

    // Create read receipts for the new message
    if (messageData?.id) {
      await createReadReceiptsForNewMessage(messageData.id, threadId, user.id)
    }

    return true
  } catch (error) {
    console.error("Exception saving message:", error)
    return false
  }
}

// Save a system-generated message (e.g. notifications)
export const saveSystemMessage = async (
  text: string,
  threadId: string
): Promise<boolean> => {
  try {
    if (!text || !threadId) {
      console.error("Missing required fields for system message", { text, threadId })
      return false
    }

    // Look up (or create) the special "system" profile
    const { data: systemProfileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("name", "system")
      .maybeSingle()

    let systemProfileId = systemProfileData?.id

    if (!systemProfileId) {
      systemProfileId = crypto.randomUUID()
      const { error: newProfileError } = await supabase.from("profiles").insert({
        id: systemProfileId,
        name: "system",
      })
      if (newProfileError) {
        console.error("Error creating system profile:", newProfileError)
        return false
      }
    }

    // Persist the system message
    const { data: messageData, error } = await supabase
      .from("messages")
      .insert({
        kind_text: text,
        selected_text: text,
        sender_profile_id: systemProfileId,
        conversation_id: threadId,
        timestamp: new Date().toISOString(),
        is_system: true,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error saving system message:", error)
      return false
    }

    // Create unread receipts for every participant in the thread (incl. sender w/ read_at)
    if (messageData?.id) {
      const { data: participants } = await supabase
        .from("thread_participants")
        .select("profile_id")
        .eq("thread_id", threadId)

      if (participants && participants.length > 0) {
        const readReceipts = participants.map(({ profile_id }) => ({
          message_id: messageData.id,
          profile_id,
          read_at: null,
        }))

        await supabase.from("message_read_receipts").insert(readReceipts)
      }
    }

    return true
  } catch (error) {
    console.error("Exception saving system message:", error)
    return false
  }
}

export const getMessages = async (threadId: string): Promise<Message[]> => {
  try {
    if (!threadId) {
      console.error("ThreadId is required")
      return []
    }

    const { data: messagesData, error: messagesError } = await supabase
      .from("message_profiles")
      .select("*")
      .eq("conversation_id", threadId)
      .order("timestamp", { ascending: true })

    if (messagesError) {
      console.error("Error fetching messages:", messagesError)
      return []
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return (messagesData || []).map((msg) => {
      const isCurrentUserMessage = msg.profile_id === user?.id
      const senderName = msg.is_system ? "system" : msg.profile_name || "Unknown User"

      return {
        id: msg.message_id,
        text: msg.selected_text || "",
        sender: senderName,
        timestamp: new Date(msg.timestamp || ""),
        kind_text: msg.kind_text || "",
        threadId: msg.conversation_id || "",
        isSystem: Boolean(msg.is_system),
        isCurrentUser: isCurrentUserMessage,
      }
    })
  } catch (error) {
    console.error("Exception fetching messages:", error)
    return []
  }
}

export const markMessagesAsRead = async (messageIds: string[]): Promise<boolean> => {
  try {
    if (!messageIds.length) return true

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("No authenticated user found", userError)
      return false
    }

    const readReceipts = messageIds.map((messageId) => ({
      message_id: messageId,
      profile_id: user.id,
      read_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from("message_read_receipts")
      .upsert(readReceipts, {
        onConflict: "message_id,profile_id",
        ignoreDuplicates: false,
      })

    if (error) {
      console.error("Error marking messages as read:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Exception marking messages as read:", error)
    return false
  }
}

/* --------------------------------------------------
   internal helpers
-------------------------------------------------- */
const createReadReceiptsForNewMessage = async (
  messageId: string,
  threadId: string,
  senderProfileId: string
): Promise<void> => {
  try {
    const { data: participants, error: participantsError } = await supabase
      .from("thread_participants")
      .select("profile_id")
      .eq("thread_id", threadId)
      .neq("profile_id", senderProfileId)

    if (participantsError || !participants) {
      console.error("Error fetching thread participants:", participantsError)
      return
    }

    const readReceipts = participants.map(({ profile_id }) => ({
      message_id: messageId,
      profile_id,
      read_at: null,
    }))

    readReceipts.push({
      message_id: messageId,
      profile_id: senderProfileId,
      read_at: new Date().toISOString(),
    })

    if (readReceipts.length > 0) {
      const { error } = await supabase.from("message_read_receipts").insert(readReceipts)
      if (error) {
        console.error("Error creating read receipts:", error)
      }
    }
  } catch (error) {
    console.error("Exception creating read receipts:", error)
  }
}

export const getUnreadMessageCount = async (threadId: string): Promise<number> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return 0

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_profile_id, is_system")
      .eq("conversation_id", threadId)
      .neq("sender_profile_id", user.id)
      .eq("is_system", false)

    if (error) {
      console.error("Error getting message data:", error)
      return 0
    }

    if (!data || data.length === 0) return 0

    const { data: readReceipts, error: readReceiptsError } = await supabase
      .from("message_read_receipts")
      .select("message_id, read_at")
      .eq("profile_id", user.id)
      .not("read_at", "is", null)

    if (readReceiptsError) {
      console.error("Error getting read receipts:", readReceiptsError)
      return 0
    }

    const readMessageIds = new Set((readReceipts || []).map((receipt) => receipt.message_id))
    const unreadCount = data.filter((message) => !readMessageIds.has(message.id)).length

    return unreadCount
  } catch (error) {
    console.error("Exception getting unread count:", error)
    return 0
  }
}

export const getAllUnreadCounts = async (): Promise<Record<string, number>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return {}

    const { data: threadParticipations, error: threadError } = await supabase
      .from("thread_participants")
      .select("thread_id")
      .eq("profile_id", user.id)

    if (threadError || !threadParticipations) {
      console.error("Error fetching threads:", threadError)
      return {}
    }

    const unreadCounts: Record<string, number> = {}

    await Promise.all(
      threadParticipations.map(async ({ thread_id }) => {
        const count = await getUnreadMessageCount(thread_id)
        unreadCounts[thread_id] = count
      })
    )

    return unreadCounts
  } catch (error) {
    console.error("Exception fetching all unread counts:", error)
    return {}
  }
}
