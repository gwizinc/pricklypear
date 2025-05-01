
import { useEffect } from "react";
import { useThreadState } from "./useThreadState";
import { useThreadMessages } from "./useThreadMessages";
import { useThreadActions } from "./useThreadActions";

export const useThreadDetails = (threadId: string | undefined) => {
  // Get thread state management
  const { 
    thread, 
    setThread, 
    isLoading, 
    setIsLoading, 
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
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    loadMessages,
    addSystemMessage
  } = useThreadMessages(threadId);

  // Get thread action handlers
  const {
    isRequestingClose,
    isGeneratingSummary,
    handleRequestClose,
    handleApproveClose,
    handleRejectClose,
    handleGenerateSummary
  } = useThreadActions(threadId, thread, messages, addSystemMessage, setThread);

  // Initialize thread and messages
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const threadData = await loadThread();
      if (threadData) {
        await loadMessages();
      }
      setIsLoading(false);
    };
    
    initialize();
  }, [threadId]);

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
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,

    // From useThreadActions
    isRequestingClose,
    isGeneratingSummary,
    handleRequestClose,
    handleApproveClose,
    handleRejectClose,
    handleGenerateSummary
  };
};
