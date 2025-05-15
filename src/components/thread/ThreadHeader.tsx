import React, { useState } from "react";
import { Loader2, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Thread } from "@/types/thread";
import { AvatarName } from "@/components/ui/avatar-name";
import { getThreadTopicInfo } from "@/constants/thread-topics";
import AddParticipantsDialog from "./AddParticipantsDialog";

interface ThreadHeaderProps {
  thread: Thread;
  /** Number of messages in the thread. Determines whether participants can be added */
  messageCount: number;
  /** Indicates if a summary is currently being generated (spinner) */
  isGeneratingSummary?: boolean;
}

const ThreadHeader = ({
  thread,
  messageCount,
  isGeneratingSummary = false,
}: ThreadHeaderProps) => {
  const { label, icon } = getThreadTopicInfo(thread.topic);
  const topicLabel = `${icon} ${label}`;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const canAddParticipants = messageCount === 0;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between">
        <div className="space-y-1">
          {thread.topic && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-white">
                {topicLabel}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {thread.createdAt.toLocaleDateString()}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          {thread.summary ? (
            <p className="text-muted-foreground text-sm">{thread.summary}</p>
          ) : (
            <p className="text-muted-foreground/70 text-sm italic">
              No summary provided
            </p>
          )}
          {isGeneratingSummary && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating summary...
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {thread.participants && thread.participants.length > 0 ? (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Participants:</span>
            <div className="flex flex-wrap gap-4">
              {thread.participants.map((participant) => (
                <AvatarName key={participant} name={participant} size="xs" />
              ))}
            </div>
            {canAddParticipants && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddDialogOpen(true)}
                  aria-label="Add participants"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <AddParticipantsDialog
                  thread={thread}
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                />
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              No other participants
            </div>
            {canAddParticipants && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddDialogOpen(true)}
                  aria-label="Add participants"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <AddParticipantsDialog
                  thread={thread}
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadHeader;
