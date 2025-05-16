import React from "react";
import { Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Thread } from "@/types/thread";
import { AvatarName } from "@/components/ui/avatar-name";
import { getThreadTopicInfo } from "@/constants/thread-topics";
import AddParticipantsDialog from "./AddParticipantsDialog";

interface ThreadHeaderProps {
  thread: Thread;
  isGeneratingSummary: boolean;
  /** Number of messages in the thread (used to disable participant-adding) */
  messageCount: number;
}

const ThreadHeader = ({
  thread,
  isGeneratingSummary,
  messageCount,
}: ThreadHeaderProps) => {
  const { label, icon } = getThreadTopicInfo(thread.topic);
  const topicLabel = `${icon} ${label}`;

  const [participants, setParticipants] = React.useState<string[]>(
    thread.participants,
  );
  React.useEffect(
    () => setParticipants(thread.participants),
    [thread.participants],
  );

  const handleAdded = (names: string[]) => {
    setParticipants((prev) => Array.from(new Set([...prev, ...names])));
  };

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
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Participants:</span>
          <div className="flex flex-wrap items-center gap-4">
            {participants.length ? (
              participants.map((p) => <AvatarName key={p} name={p} size="xs" />)
            ) : (
              <span className="text-sm text-muted-foreground">
                No other participants
              </span>
            )}

            <AddParticipantsDialog
              threadId={thread.id}
              currentParticipantNames={participants}
              disabled={messageCount > 0}
              onAdded={handleAdded}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadHeader;
