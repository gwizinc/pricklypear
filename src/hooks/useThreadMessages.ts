
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, saveMessage, saveSystemMessage, getUnreadMessageCount } from "@/services/messageService";
import { reviewMessage } from "@/utils/messageReview";
import { generateThreadSummary } from "@/services/threadService";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/types/message";
import type { Thread } from "@/types/thread";
import type { Database } from "@/integrations/supabase/types";

type MessageReadReceiptWithThread = 
  Database['public']['Tables']['message_read_receipts']['Row'] & 
  { conversation_id?: string | null };

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
  
  const lastTimestampRef = useRef<string>('');
  
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
  
  useEffect(() => {
    if (!threadId || !user) return;
    
    console.log(`Setting up message_read_receipts subscription for thread ${threadId}`);
    
    loadMessages();
    
    const channel = supabase.channel(`message_read_receipts-${threadId}`);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_read_receipts',
        },
        async (payload) => {
          if (payload.eventType !== 'INSERT' && payload.eventType !== 'UPDATE') return;
          
          const rec = payload.new;
          
          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .select('conversation_id')
            .eq('id', rec.message_id)
            .single();
          
          if (messageError || !messageData) {
            console.error("Error fetching message for receipt:", messageError);
            return;
          }
          
          const messageThreadId = messageData.conversation_id;
          if (messageThreadId !== threadId) return;
          
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', threadId)
            .gt('timestamp', lastTimestampRef.current || '1970-01-01T00:00:00Z')
            .order('timestamp', { ascending: true });
          
          if (error) {
            console.error("Error fetching new messages:", error);
            return;
          }
          
          if (data && data.length) {
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
            
            // Update messages state with new messages
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newMessages = mapped.filter(m => !existingIds.has(m.id));
              return [...prev, ...newMessages];
            });
            
            if (mapped.length) {
              lastTimestampRef.current = mapped[mapped.length - 1].timestamp?.toISOString?.() ?? lastTimestampRef.current;
            }
          }
        }
      );
    
    channel.subscribe();
    
    return () => {
      console.log(`Unsubscribing from message_read_receipts for thread ${threadId}`);
      supabase.removeChannel(channel);
    };
  }, [threadId, user]);

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
