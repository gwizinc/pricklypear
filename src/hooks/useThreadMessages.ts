
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, saveMessage, saveSystemMessage } from "@/services/messageService";
import { reviewMessage } from "@/utils/messageReview";
import type { Message } from "@/types/message";

export const useThreadMessages = (threadId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Message review states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  const [kindMessage, setKindMessage] = useState("");
  const [isReviewingMessage, setIsReviewingMessage] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

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
        original_text: originalMessage,
        kind_text: kindMessage,
        threadId: threadId,
        isCurrentUser: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
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
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
    addSystemMessage
  };
};
