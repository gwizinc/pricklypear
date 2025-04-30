
import { saveSystemMessage } from "@/services/messageService";

// Only updating the handleRequestClose function
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
