
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getThread,
  requestCloseThread, 
  approveCloseThread, 
  rejectCloseThread,
  generateThreadSummary
} from "@/services/threadService";
import { getMessages, saveMessage, saveSystemMessage } from "@/services/messageService";
import { reviewMessage } from "@/utils/messageReview";
import type { Thread } from "@/types/thread";
import type { Message } from "@/types/message";

export const useThreadDetails = (threadId: string | undefined) => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRequestingClose, setIsRequestingClose] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Message review states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  const [kindMessage, setKindMessage] = useState("");
  const [isReviewingMessage, setIsReviewingMessage] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadThread = async () => {
      if (!threadId) {
        navigate("/threads");
        return;
      }
      
      setIsLoading(true);
      
      const threadData = await getThread(threadId);
      if (!threadData) {
        toast({
          title: "Error",
          description: "Thread not found",
          variant: "destructive",
        });
        navigate("/threads");
        return;
      }
      
      setThread(threadData);
      
      const messagesData = await getMessages(threadId);
      setMessages(messagesData);
      
      setIsLoading(false);
    };
    
    loadThread();
  }, [threadId, navigate, toast]);

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
    if (!selectedMessage.trim() || !thread || !user || !threadId) return;
    
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
      // Add to local messages list immediately
      const newMsg: Message = {
        id: crypto.randomUUID(), // Generate a temporary ID
        text: selectedMessage,
        sender: currentUser,
        timestamp: new Date(),
        original_text: originalMessage,
        kind_text: kindMessage,
        threadId: threadId
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

  const handleRequestClose = async () => {
    if (!threadId || !user) return;
    
    setIsRequestingClose(true);
    
    const currentUser = user.email?.split('@')[0] || '';
    const success = await requestCloseThread(threadId, currentUser);
    
    if (success) {
      // Add a system message about the close request
      await saveSystemMessage(
        `${currentUser} has requested to close this thread.`,
        threadId
      );
      
      // Update local thread state to reflect the change
      if (thread) {
        setThread({
          ...thread,
          closeRequestedBy: currentUser
        });
      }
      
      toast({
        title: "Close request sent",
        description: "Waiting for the other participant to approve closing this thread.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to request thread closure. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsRequestingClose(false);
  };

  const handleApproveClose = async () => {
    if (!threadId || !thread || !user) return;
    
    const currentUser = user.email?.split('@')[0] || '';
    const success = await approveCloseThread(threadId);
    
    if (success) {
      // Add a system message about the thread closure
      await saveSystemMessage(
        `${currentUser} approved closing this thread. The thread is now closed.`,
        threadId
      );
      
      // Update local thread state
      setThread({
        ...thread,
        status: 'closed',
        closeRequestedBy: null
      });
      
      toast({
        title: "Thread closed",
        description: "This thread has been closed successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to close thread. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectClose = async () => {
    if (!threadId || !thread || !user) return;
    
    const currentUser = user.email?.split('@')[0] || '';
    const success = await rejectCloseThread(threadId);
    
    if (success) {
      // Add a system message about the rejection
      await saveSystemMessage(
        `${currentUser} rejected the request to close this thread.`,
        threadId
      );
      
      // Update local thread state
      setThread({
        ...thread,
        closeRequestedBy: null
      });
      
      toast({
        title: "Close request rejected",
        description: "The request to close this thread has been rejected.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to reject the close request. Please try again.",
        variant: "destructive",
      });
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
      } else {
        toast({
          title: "Warning",
          description: "Could not generate a summary. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return {
    thread,
    messages,
    newMessage,
    isLoading,
    isSending,
    isRequestingClose,
    isGeneratingSummary,
    isReviewDialogOpen,
    originalMessage,
    kindMessage,
    isReviewingMessage,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    handleRequestClose,
    handleApproveClose,
    handleRejectClose,
    handleGenerateSummary
  };
};
