
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { approveCloseThread, rejectCloseThread } from "@/services/threadService";
import { saveSystemMessage } from "@/services/messageService";
import { ProfileUser } from "@/types/user";

interface ThreadCloseRequestProps {
  threadId: string;
  requestedByUser: ProfileUser;
  currentUser: ProfileUser;
  onApproved: () => void;
  onRejected: () => void;
}

const ThreadCloseRequest = ({ 
  threadId, 
  requestedByUser, 
  currentUser,
  onApproved,
  onRejected
}: ThreadCloseRequestProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Don't show actions to the user who requested the closure
  const showActions = requestedByUser.id !== currentUser.id;

  const handleApprove = async () => {
    setIsLoading(true);
    const success = await approveCloseThread(threadId);
    
    if (success) {
      // Add a system message about the thread being closed
      await saveSystemMessage(
        `${currentUser.name} approved ${requestedByUser.name}'s request to close this thread.`,
        threadId
      );
      
      toast({
        title: "Thread closed",
        description: "The thread has been closed successfully.",
      });
      onApproved();
    } else {
      toast({
        title: "Error",
        description: "Failed to close the thread. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    const success = await rejectCloseThread(threadId);
    
    if (success) {
      // Add a system message about the rejection
      await saveSystemMessage(
        `${currentUser.name} rejected ${requestedByUser.name}'s request to close this thread.`,
        threadId
      );
      
      toast({
        title: "Request rejected",
        description: "The close request has been rejected.",
      });
      onRejected();
    } else {
      toast({
        title: "Error",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-muted p-4 rounded-lg mb-4 animate-fade-in">
      <p className="font-medium mb-3">
        <span className="text-primary">{requestedByUser.name}</span> has requested to close this thread.
        {showActions ? (
          <span> Do you agree to close this conversation?</span>
        ) : (
          <span> Waiting for other participant to approve.</span>
        )}
      </p>
      
      {showActions && (
        <div className="flex items-center gap-2 mt-2">
          <Button 
            onClick={handleApprove} 
            variant="default" 
            size="sm"
            disabled={isLoading}
          >
            <Check className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button 
            onClick={handleReject} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThreadCloseRequest;
