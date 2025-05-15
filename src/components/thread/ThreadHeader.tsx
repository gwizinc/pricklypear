import { Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Thread } from "@/types/thread";
import { AvatarName } from "@/components/ui/avatar-name";
import { getThreadTopicInfo } from "@/constants/thread-topics";

interface ThreadHeaderProps {
  thread: Thread;
  isGeneratingSummary: boolean;
}

const ThreadHeader = ({ thread, isGeneratingSummary }: ThreadHeaderProps) => {
  const { label, icon } = getThreadTopicInfo(thread.topic);
  const topicLabel = `${icon} ${label}`;

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
                <AvatarName
                  key={participant}
                  name={participant}
                  size="xs"
                  /* border already applied inside the component */
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No other participants
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadHeader;
