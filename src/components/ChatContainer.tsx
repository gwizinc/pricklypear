import React, { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import ChatPanel from "./ChatPanel"
import type { Message } from "@/types/message"
import { getMessages } from "@/services/messageService"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

interface ChatContainerProps {
  user1: string
  user2: string
  threadId: string
  ephemeralMode?: boolean
  ephemeralMessages?: Message[]
  onSendEphemeralMessage?: (message: Message) => void
  singleUserMode?: boolean
  currentUserEmail?: string
}

const ChatContainer = ({
  user1,
  user2,
  threadId,
  ephemeralMode = false,
  ephemeralMessages = [],
  onSendEphemeralMessage,
  singleUserMode = false,
  currentUserEmail = "",
}: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Determine the current user based on email if in single user mode
  const currentUser = singleUserMode ? (currentUserEmail ? currentUserEmail.split("@")[0] : user1) : null

  // Verify users exist in the database when component mounts
    const verifyUsers = async () => {
      if (!ephemeralMode) {
        const { data: user1Data } = await supabase.from("profiles").select("name").eq("name", user1).maybeSingle()
        const { data: user2Data } = await supabase.from("profiles").select("name").eq("name", user2).maybeSingle()

        if (!user1Data) {
          toast({
            title: "User Not Found",
            description: `User "${user1}" doesn't exist in the database. Messages from this user won't be saved.`,
            variant: "default",
          })
        }

        if (!user2Data) {
          toast({
            title: "User Not Found",
            description: `User "${user2}" doesn't exist in the database. Messages from this user won't be saved.`,
            variant: "default",
          })
        }
      }
    }

    verifyUsers()
  }, [user1, user2, ephemeralMode, toast])

  /* --------------------------------------------------
     load messages
  -------------------------------------------------- */
  useEffect(() => {
    if (!threadId) {
      toast({
        title: "Error",
        description: "Thread ID is required",
        variant: "destructive",
      })
      navigate("/threads")
      return
    }

    if (!ephemeralMode) {
      const fetchMessages = async () => {
        setIsLoading(true)
        const fetchedMessages = await getMessages(threadId)
        setMessages(fetchedMessages)
        setIsLoading(false)
      }

      fetchMessages()
    } else {
      setIsLoading(false)
    }
  }, [threadId, navigate, toast, ephemeralMode])

  /* --------------------------------------------------
     optimistic send helper
  -------------------------------------------------- */
  const handleSendMessage = async (sender: string, text: string) => {
    if (!threadId) {
      toast({
        title: "Error",
        description: "Cannot send messages outside of a thread",
        variant: "destructive",
      })
      return
    }

    const tempId = uuidv4()
    const tempMessage: Message = {
      id: tempId,
      text,
      sender,
      timestamp: new Date(),
      threadId,
      kind_text: text,
    }

    if (ephemeralMode && onSendEphemeralMessage) {
      onSendEphemeralMessage(tempMessage)
    } else {
      setMessages((prevMessages) => [...prevMessages, tempMessage])
    }
    // Actual persistence handled by ChatPanel after AI review (except in ephemeral mode)
  }

  const displayMessages = ephemeralMode ? ephemeralMessages : messages

  if (isLoading) {
    return (
      <div className="col-span-2 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  /* --------------------------------------------------
     single-user vs two-panel layout
  -------------------------------------------------- */
  if (singleUserMode) {
    const isUser1 = currentUser === user1
    const otherUser = isUser1 ? user2 : user1
    const currentUserName = isUser1 ? user1 : user2

    return (
      <ChatPanel
        messages={displayMessages}
        currentUser={currentUserName}
        bgColor={isUser1 ? "bg-chat-blue/20" : "bg-chat-purple/20"}
        onSendMessage={(text) => handleSendMessage(currentUserName, text)}
        threadId={threadId}
        ephemeralMode={ephemeralMode}
        otherUser={otherUser}
      />
    )
  }

  // default two-panel
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-[85vh] rounded-lg overflow-hidden border shadow-md">
      <ChatPanel
        messages={displayMessages}
        currentUser={user1}
        bgColor="bg-chat-blue/20"
        onSendMessage={(text) => handleSendMessage(user1, text)}
        threadId={threadId}
        ephemeralMode={ephemeralMode}
        otherUser={user2}
      />
      <ChatPanel
        messages={displayMessages}
        currentUser={user2}
        bgColor="bg-chat-purple/20"
        onSendMessage={(text) => handleSendMessage(user2, text)}
        threadId={threadId}
        ephemeralMode={ephemeralMode}
        otherUser={user1}
      />
    </div>
  )
}

export default ChatContainer
