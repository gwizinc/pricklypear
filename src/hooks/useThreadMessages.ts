
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, saveMessage, saveSystemMessage, getUnreadMessageCount } from "@/services/messageService";
import { reviewMessage } from "@/utils/messageReview";
import { generateThreadSummary } from "@/services/threadService";
import type { Message } from "@/types/message";
import type { Thread } from "@/types/thread";

export const useThreadMessages = (threadId: string | undefined, thread: Thread | null, setThread: (thread: Thread | null) => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Message review states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  const [kindMessage, setKindMessage] = useState("");
  const [isReviewingMessage, setIsReviewingMessage] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load unread count for the thread
  useEffect(() => {
    if (threadId) {
      const loadUnreadCount = async () => {
        const count = await getUnreadMessageCount(threadId);
        setUnreadCount(count);
      };
      
      loadUnreadCount();
    }
  }, [threadId, messages]);

  const loadMessages = async () => {
    if (!threadId) return [];
    
    const messagesData = await getMessages(threadId);
    setMessages(messagesData);
    return messagesData;
  };

  const handleInitiateMessageReview = async () => {
    if (!newMessage.trim() || !user) return;
    
    setOriginalMessage(newMessage);
    setIsReviewingMessage(true);
    
    try {
      // Call the message review API
      const kindText = await reviewMessage(newMessage);
      setKindMessage(kindText);
    } catch (error) {
      console.error("Error reviewing message:", error);
      // If review fails, use the original message
      setKindMessage(newMessage);
    } finally {
      setIsReviewingMessage(false);
      setIsReviewDialogOpen(true);
    }
  };

  const handleGenerateSummary = async () => {
    if (!threadId || !thread || messages.length === 0) return;
    
    setIsGeneratingSummary(true);
    
    try {
      const summary = await generateThreadSummary(threadId, messages);
      
      if (summary) {
        // Update local thread state with the new summary
        setThread({
          ...thread,
          summary
        });
        
        toast({
          title: "Summary generated",
          description: "Thread summary has been successfully generated and saved.",
        });
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSendReviewedMessage = async (selectedMessage: string) => {
    if (!selectedMessage.trim() || !user || !threadId) return;
    
    setIsSending(true);
    
    const currentUser = user.email?.split('@')[0] || '';
    
    // Save the final message with original and kind versions
    const success = await saveMessage(
      currentUser,
      originalMessage,
      threadId,
      selectedMessage, // Using the reviewed/selected text
      kindMessage  // The kind version from AI
    );
    
    if (success) {
      // Add to local messages list immediately with isCurrentUser flag
      const newMsg: Message = {
        id: crypto.randomUUID(), // Generate a temporary ID
        text: selectedMessage,
        sender: currentUser,
        timestamp: new Date(),
        kind_text: kindMessage,
        threadId: threadId,
        isCurrentUser: true // Explicitly set isCurrentUser to true
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      
      // Generate a new summary after sending a message
      if (thread) {
        // Always generate summary after sending a message
        handleGenerateSummary();
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSending(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    handleInitiateMessageReview();
  };

  const addSystemMessage = async (message: string) => {
    if (!threadId) return false;
    
    const success = await saveSystemMessage(message, threadId);
    if (success) {
      await loadMessages();
    }
    return success;
  };

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
    addSystemMessage
  };
};
