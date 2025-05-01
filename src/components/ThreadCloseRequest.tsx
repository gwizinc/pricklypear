
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { approveCloseThread, rejectCloseThread } from "@/services/threadService";
import { saveSystemMessage } from "@/services/messageService";
import { supabase } from "@/integrations/supabase/client";

interface ThreadCloseRequestProps {
  threadId: string;
  requestedByUserId: string;
  currentUserId: string;
  onApproved: () => void;
  onRejected: () => void;
}

const ThreadCloseRequest = ({ 
  threadId, 
  requestedByUserId,
  currentUserId,
  onApproved,
  onRejected
}: ThreadCloseRequestProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [requestedByName, setRequestedByName] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  
  // Fetch user names from profile IDs
  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        // Fetch requested by user name
        if (requestedByUserId) {
          const { data: requestedByData, error: requestedByError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', requestedByUserId)
            .single();
            
          if (!requestedByError && requestedByData) {
            setRequestedByName(requestedByData.name);
          }
        }
        
        // Fetch current user name
        if (currentUserId) {
          const { data: currentUserData, error: currentUserError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', currentUserId)
            .single();
            
          if (!currentUserError && currentUserData) {
            setCurrentUserName(currentUserData.name);
          }
        }
      } catch (error) {
        console.error('Error fetching user names:', error);
      }
    };
    
    fetchUserNames();
  }, [requestedByUserId, currentUserId]);
  
  // Don't show actions to the user who requested the closure
  const showActions = requestedByUserId !== currentUserId;

  const handleApprove = async () => {
    setIsLoading(true);
    const success = await approveCloseThread(threadId);
    
    if (success) {
      // Add a system message about the thread being closed
      await saveSystemMessage(
        `${currentUserName} approved ${requestedByName}'s request to close this thread.`,
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
        `${currentUserName} rejected ${requestedByName}'s request to close this thread.`,
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

  if (!requestedByName) {
    return <div className="bg-muted p-4 rounded-lg mb-4 animate-pulse">Loading request details...</div>;
  }

  return (
    <div className="bg-muted p-4 rounded-lg mb-4 animate-fade-in">
      <p className="font-medium mb-3">
        <span className="text-primary">{requestedByName}</span> has requested to close this thread.
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
            {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />} Approve
          </Button>
          <Button 
            onClick={handleReject} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <X className="h-4 w-4 mr-1" />} Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThreadCloseRequest;
