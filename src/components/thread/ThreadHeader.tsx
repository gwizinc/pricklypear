
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Users } from "lucide-react";
import type { Thread } from "@/types/thread";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <div className="space-y-4 mb-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">{thread.title}</h1>
        
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

      <div className="flex flex-col space-y-2">
        <p className="text-sm text-muted-foreground">
          Created {thread.createdAt.toLocaleDateString()}
        </p>
        
        {thread.participants && thread.participants.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Participants:</span>
            <div className="flex -space-x-2 mr-2">
              {thread.participants.slice(0, 3).map((participant, i) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {participant.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {thread.participants.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadHeader;
