
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  requestCloseThread, 
  approveCloseThread, 
  rejectCloseThread
} from "@/services/threadService";
import type { Thread } from "@/types/thread";
import type { Message } from "@/types/message";

export const useThreadActions = (
  threadId: string | undefined, 
  thread: Thread | null,
  messages: Message[],
  addSystemMessage: (message: string) => Promise<boolean>,
  setThread: (thread: Thread | null) => void
) => {
  const [isRequestingClose, setIsRequestingClose] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRequestClose = async () => {
    if (!threadId || !user) return;
    
    setIsRequestingClose(true);
    
    // Use user.id directly as the profile ID
    const success = await requestCloseThread(threadId, user.id);
    
    if (success) {
      // Get user name for the system message
      const currentUser = user.email?.split('@')[0] || user.id;
      
      // Add a system message about the close request
      await addSystemMessage(`${currentUser} has requested to close this thread.`);
      
      // Update local thread state to reflect the change
      if (thread) {
        setThread({
          ...thread,
          closeRequestedBy: user.id
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
    
    const currentUser = user.email?.split('@')[0] || user.id;
    const success = await approveCloseThread(threadId);
    
    if (success) {
      // Add a system message about the thread closure
      await addSystemMessage(`${currentUser} approved closing this thread. The thread is now closed.`);
      
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
    
    const currentUser = user.email?.split('@')[0] || user.id;
    const success = await rejectCloseThread(threadId);
    
    if (success) {
      // Add a system message about the rejection
      await addSystemMessage(`${currentUser} rejected the request to close this thread.`);
      
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

  return {
    isRequestingClose,
    handleRequestClose,
    handleApproveClose,
    handleRejectClose
  };
};
