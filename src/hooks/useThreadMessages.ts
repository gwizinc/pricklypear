import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import {
  getMessages,
  saveMessage,
  saveSystemMessage,
  getUnreadMessageCount,
} from "@/services/messageService"
import { reviewMessage } from "@/utils/messageReview"
import { generateThreadSummary } from "@/services/threadService"
import type { Message } from "@/types/message"
import type { Thread } from "@/types/thread"

export const useThreadMessages = (
  threadId: string | undefined,
  thread: Thread | null,
  setThread: (thread: Thread | null) => void
) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Message review states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [originalMessage, setOriginalMessage] = useState("")
  const [kindMessage, setKindMessage] = useState("")
  const [isReviewingMessage, setIsReviewingMessage] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  /* --------------------------------------------------
     unread counts
  -------------------------------------------------- */
  useEffect(() => {
    if (threadId) {
      const loadUnreadCount = async () => {
        const count = await getUnreadMessageCount(threadId)
        setUnreadCount(count)
      }

      loadUnreadCount()
    }
  }, [threadId, messages])

  const loadMessages = async () => {
    if (!threadId) return []

    const messagesData = await getMessages(threadId)
    setMessages(messagesData)
    return messagesData
  }

  /* --------------------------------------------------
     message review helpers
  -------------------------------------------------- */
  const handleInitiateMessageReview = async () => {
    if (!newMessage.trim() || !user) return

    setOriginalMessage(newMessage)
    setIsReviewingMessage(true)

    try {
      const kindText = await reviewMessage(newMessage)
      setKindMessage(kindText)
    } catch (error) {
      console.error("Error reviewing message:", error)
      setKindMessage(newMessage)
    } finally {
      setIsReviewingMessage(false)
      setIsReviewDialogOpen(true)
    }
  }

  const handleGenerateSummary = async () => {
    if (!threadId || !thread || messages.length === 0) return

    setIsGeneratingSummary(true)

    try {
      const summary = await generateThreadSummary(threadId, messages)

      if (summary) {
        setThread({
          ...thread,
          summary,
        })

        toast({
          title: "Summary generated",
          description: "Thread summary has been successfully generated and saved.",
        })
      }
    } catch (error) {
      console.error("Error generating summary:", error)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  /* --------------------------------------------------
     sending a reviewed message
  -------------------------------------------------- */
  const handleSendReviewedMessage = async (selectedMessage: string) => {
    if (!selectedMessage.trim() || !user || !threadId) return

    setIsSending(true)

    const currentUser = user.email?.split("@")[0] || ""

    // Persist the final message (original text is *not* stored anymore)
    const success = await saveMessage(
      currentUser,
      originalMessage,
      threadId,
      selectedMessage,
      kindMessage
    )

    if (success) {
      const newMsg: Message = {
        id: crypto.randomUUID(),
        text: selectedMessage,
        sender: currentUser,
        timestamp: new Date(),
        kind_text: kindMessage,
        threadId: threadId,
        isCurrentUser: true,
      }

      setMessages((prev) => [...prev, newMsg])
      setNewMessage("")

      if (thread) {
        handleGenerateSummary()
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }

    setIsSending(false)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    handleInitiateMessageReview()
  }

  /* --------------------------------------------------
     system message helper
  -------------------------------------------------- */
  const addSystemMessage = async (message: string) => {
    if (!threadId) return false

    const success = await saveSystemMessage(message, threadId)
    if (success) {
      await loadMessages()
    }
    return success
  }

  return {
    messages,
    newMessage,
    isSending,
    isReviewDialogOpen,
    originalMessage,
    kindMessage,
    isReviewingMessage,
    isGeneratingSummary,
    unreadCount,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
    addSystemMessage,
  }
}
