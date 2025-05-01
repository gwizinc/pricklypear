
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Users } from "lucide-react";
import type { Thread } from "@/types/thread";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ThreadHeaderProps {
  thread: Thread;
  isThreadClosed: boolean;
  isRequestingClose: boolean;
  onRequestClose: () => void;
  isGeneratingSummary: boolean;
}

const ThreadHeader = ({
  thread,
  isThreadClosed,
  isRequestingClose,
  onRequestClose,
  isGeneratingSummary,
}: ThreadHeaderProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          {thread.summary ? (
            <p className="text-muted-foreground text-sm">{thread.summary}</p>
          ) : (
            <p className="text-muted-foreground/70 text-sm italic">No summary provided</p>
          )}
          {isGeneratingSummary && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating summary...
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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
        
        {thread.participants && thread.participants.length > 0 ? (
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
        ) : (
          <div className="text-sm text-muted-foreground">No other participants</div>
        )}
      </div>
    </div>
  );
};

export default ThreadHeader;
