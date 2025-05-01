
import { useEffect, useState } from "react";
import { useThreadState } from "./useThreadState";
import { useThreadMessages } from "./useThreadMessages";
import { useThreadActions } from "./useThreadActions";

export const useThreadDetails = (threadId: string | undefined) => {
  const [initialized, setInitialized] = useState(false);

  // Get thread state management
  const { 
    thread, 
    setThread, 
    isLoading: isThreadLoading, 
    setIsLoading: setIsThreadLoading, 
    loadThread 
  } = useThreadState(threadId);

  // Get message handling
  const {
    messages,
    newMessage,
    isSending,
    isReviewDialogOpen,
    originalMessage,
    kindMessage,
    isReviewingMessage,
    isGeneratingSummary,
    isLoading: isMessagesLoading,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
    addSystemMessage
  } = useThreadMessages(threadId, thread, setThread);

  // Get thread action handlers
  const {
    isRequestingClose,
    handleRequestClose,
    handleApproveClose,
    handleRejectClose
  } = useThreadActions(threadId, thread, messages, addSystemMessage, setThread);

  // Initialize thread and messages - only once
  useEffect(() => {
    const initialize = async () => {
      if (initialized || !threadId) return;
      
      console.log("Initializing thread details");
      setIsThreadLoading(true);
      
      try {
        // First load the thread data
        const threadData = await loadThread();
        console.log("Thread data loaded:", threadData?.id);
        
        // Then, if thread data was loaded successfully, load messages
        if (threadData) {
          await loadMessages();
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Error initializing thread details:", error);
      } finally {
        setIsThreadLoading(false);
      }
    };
    
    initialize();
  }, [threadId, loadThread, loadMessages, setIsThreadLoading, initialized]);

  // Combine loading states from thread and messages
  const isLoading = isThreadLoading || isMessagesLoading;

  // Return all the hooks' values and methods
  return {
    // From useThreadState
    thread,
    isLoading,

    // From useThreadMessages
    messages,
    newMessage,
    isSending,
    isReviewDialogOpen,
    originalMessage,
    kindMessage,
    isReviewingMessage,
    isGeneratingSummary,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages, // Expose loadMessages function

    // From useThreadActions
    isRequestingClose,
    handleRequestClose,
    handleApproveClose,
    handleRejectClose
  };
};
