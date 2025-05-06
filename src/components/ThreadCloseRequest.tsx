import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { approveCloseThread, rejectCloseThread } from "@/services/threadService";
import { saveSystemMessage } from "@/services/messageService";
import { formatSystemMessage } from "@/messages/systemMessages";
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
      // Nothing to fetch if one of the ids is missing
      if (!requestedByUserId || !currentUserId) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", [requestedByUserId, currentUserId]);

        if (error) {
          throw error;
        }

        const nameMap: Record<string, string> = {};
        data?.forEach((profile) => {
          nameMap[profile.id] = profile.name;
        });

        setRequestedByName(nameMap[requestedByUserId] ?? "");
        setCurrentUserName(nameMap[currentUserId] ?? "");
      } catch (error) {
        console.error("Error fetching user names:", error);
        toast({
          title: "Error",
          description: "Unable to load participant details.",
          variant: "destructive",
        });
      }
    };

    fetchUserNames();
    // We intentionally include `toast` in the dependency array to satisfy
    // the exhaustive-deps rule without changing behaviour.
  }, [requestedByUserId, currentUserId, toast]);

  // Don't show actions to the user who requested the closure
  const showActions = requestedByUserId !== currentUserId;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const success = await approveCloseThread(threadId);

      if (!success) {
        toast({
          title: "Error",
          description: "Failed to close the thread. Please try again.",
          variant: "destructive",
        });
        return;
      }

      await saveSystemMessage(
        formatSystemMessage("closeApprovedWithRequester", {
          actor: currentUserName,
          requester: requestedByName,
        }),
        threadId,
      );

      // Reset loading BEFORE notifying parent to avoid setting state
      // after the component might have unmounted.
      setIsLoading(false);
      onApproved();

      toast({
        title: "Thread closed",
        description: "The thread has been closed successfully.",
      });
    } catch (error) {
      console.error("Error approving close request:", error);
      toast({
        title: "Error",
        description: "Failed to close the thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const success = await rejectCloseThread(threadId);

      if (!success) {
        toast({
          title: "Error",
          description: "Failed to reject the request. Please try again.",
          variant: "destructive",
        });
        return;
      }

      await saveSystemMessage(
        formatSystemMessage("closeRejectedWithRequester", {
          actor: currentUserName,
          requester: requestedByName,
        }),
        threadId,
      );

      setIsLoading(false);
      onRejected();

      toast({
        title: "Request rejected",
        description: "The close request has been rejected.",
      });
    } catch (error) {
      console.error("Error rejecting close request:", error);
      toast({
        title: "Error",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
