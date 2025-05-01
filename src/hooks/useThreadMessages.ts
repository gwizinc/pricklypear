import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, saveMessage, saveSystemMessage, getUnreadMessageCount } from "@/services/messageService";
import { reviewMessage } from "@/utils/messageReview";
import { generateThreadSummary } from "@/services/threadService";
import { messageStore } from "@/contexts/messageStore";
import { supabaseClient } from "@/lib/supabaseClient";
import { subscribeToUnreadReceipts } from "@/lib/realtime";
import type { Message } from "@/types/message";
import type { Thread } from "@/types/thread";

export const useThreadMessages = (threadId: string | undefined, thread: Thread | null, setThread: (thread: Thread | null) => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Message review states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  const [kindMessage, setKindMessage] = useState("");
  const [isReviewingMessage, setIsReviewingMessage] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Add reference to track last message timestamp
  const lastTimestampRef = useRef<string>('');

  // Load unread count for the thread
  useEffect(() => {
    if (threadId) {
      const loadUnreadCount = async () => {
        try {
          const count = await getUnreadMessageCount(threadId);
          setUnreadCount(count);
        } catch (error) {
          console.error("Error loading unread count:", error);
        }
      };
      
      loadUnreadCount();
    }
  }, [threadId]);

  // Subscribe to message store for this thread
  useEffect(() => {
    if (!threadId) return;
    
    console.log(`Subscribing to message store for thread ${threadId}`);
    
    // Subscribe to message store updates
    const unsubscribe = messageStore.subscribe(threadId, (updatedMessages) => {
      console.log(`Received ${updatedMessages.length} messages from store for thread ${threadId}`);
      setMessages(updatedMessages);
    });
    
    return unsubscribe;
  }, [threadId]);

  // New effect to subscribe to unread receipts for real-time updates
  useEffect(() => {
    if (!threadId || !user) return;
    
    const unsub = subscribeToUnreadReceipts(user.id, async ({ new: rec }) => {
      const threadIdFromEvent = (rec as any)?.thread_id ?? null;
      if (threadIdFromEvent !== threadId) return;
      
      // Fetch latest messages since the last timestamp
      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', threadId)
        .gt('timestamp', lastTimestampRef.current)
        .order('timestamp', { ascending: true });
      
      if (!error && data && data.length) {
        const existing = messageStore.getMessages(threadId);
        const mapped = data.map((msg) => ({
          id: msg.id,
          text: msg.selected_text,
          sender: msg.sender_profile_id,
          timestamp: new Date(msg.timestamp || ''),
          original_text: msg.original_text,
          kind_text: msg.kind_text,
          threadId: threadId,
          isSystem: Boolean(msg.is_system),
        }));
        
        messageStore.setMessages(threadId, [...existing, ...mapped]);
        
        if (mapped.length) {
          lastTimestampRef.current = mapped[mapped.length - 1].timestamp?.toISOString?.() ?? lastTimestampRef.current;
        }
      }
    });
    
    return unsub;
  }, [threadId, user]);

  const loadMessages = useCallback(async () => {
    if (!threadId || hasLoaded) return [];
    
    setIsLoading(true);
    
    try {
      console.log(`Loading messages for thread ${threadId}`);
      const messagesData = await getMessages(threadId);
      console.log(`Loaded ${messagesData.length} messages for thread ${threadId}`);
      
      // Update the message store with the loaded messages
      messageStore.setMessages(threadId, messagesData);
      
      // Update last timestamp reference if messages exist
      if (messagesData.length > 0) {
        const sortedMessages = [...messagesData].sort((a, b) => 
          a.timestamp.getTime() - b.timestamp.getTime()
        );
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        lastTimestampRef.current = lastMessage.timestamp?.toISOString?.() ?? '';
      }
      
      // Mark as loaded to prevent redundant loading
      setHasLoaded(true);
      setIsLoading(false);
      return messagesData;
    } catch (error) {
      console.error(`Error loading messages for thread ${threadId}:`, error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try refreshing the page.",
        variant: "destructive",
      });
      return [];
    }
  }, [threadId, toast, hasLoaded]);

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
        original_text: originalMessage,
        kind_text: kindMessage,
        threadId: threadId,
        isCurrentUser: true // Explicitly set isCurrentUser to true
      };
      
      // Reset the message input
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
    isLoading: isLoading,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
    addSystemMessage
  };
};
