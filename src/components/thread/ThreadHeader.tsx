
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import type { Thread } from "@/types/thread";

interface ThreadHeaderProps {
  thread: Thread;
  isThreadClosed: boolean;
  isRequestingClose: boolean;
  onOpenSummaryDialog: () => void;
  onRequestClose: () => void;
}

const ThreadHeader = ({
  thread,
  isThreadClosed,
  isRequestingClose,
  onOpenSummaryDialog,
  onRequestClose,
}: ThreadHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{thread.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Created {thread.createdAt.toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={onOpenSummaryDialog}
          disabled={isThreadClosed}
        >
          {thread.summary ? "Edit Summary" : "Add Summary"}
        </Button>
        
        {!isThreadClosed && !thread.closeRequestedBy && (
          <Button 
            variant="outline" 
            onClick={onRequestClose}
            disabled={isRequestingClose}
          >
            {isRequestingClose ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            Request Close
          </Button>
        )}
      </div>
    </div>
  );
};

export default ThreadHeader;
