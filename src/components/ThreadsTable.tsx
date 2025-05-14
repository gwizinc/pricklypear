import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AvatarName } from "@/components/ui/avatar-name";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { getThreadTopicInfo } from "@/constants/thread-topics";
import type { Thread } from "@/types/thread";

interface ThreadsTableProps {
  threads: Thread[];
  isLoading: boolean;
}

const ThreadsTable: React.FC<ThreadsTableProps> = ({ threads, isLoading }) => {
  const { threadCounts } = useUnreadMessages();
  const navigate = useNavigate();

  const sortedThreads = useMemo(() => {
    const sortDesc = (a: Thread, b: Thread) =>
      b.createdAt.getTime() - a.createdAt.getTime();

    const unreadPredicate = (t: Thread) => (threadCounts[t.id] || 0) > 0;

    const withUnread = [...threads].filter(unreadPredicate).sort(sortDesc);
    const withoutUnread = [...threads]
      .filter((t) => !unreadPredicate(t))
      .sort(sortDesc);

    return [...withUnread, ...withoutUnread];
  }, [threads, threadCounts]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sortedThreads.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No threads found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-muted border text-sm">
        <thead className="bg-secondary/20 text-left">
          <tr>
            <th className="px-4 py-2 font-semibold">State</th>
            <th className="px-4 py-2 font-semibold">Topic</th>
            <th className="px-4 py-2 font-semibold">Title</th>
            <th className="px-4 py-2 font-semibold">Date Created</th>
            <th className="px-4 py-2 font-semibold">Participants</th>
            <th className="px-4 py-2 font-semibold">Summary</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-muted">
          {sortedThreads.map((thread) => {
            const topicInfo = getThreadTopicInfo(thread.topic);
            const participants = thread.participants ?? [];

            return (
              <tr
                key={thread.id}
                onClick={() => navigate(`/threads/${thread.id}`)}
                className="cursor-pointer hover:bg-muted/50"
              >
                {/* State */}
                <td className="px-4 py-2">
                  <Badge
                    variant={thread.status === "open" ? "secondary" : "outline"}
                    className={
                      thread.status === "open"
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground"
                    }
                  >
                    {thread.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </td>

                {/* Topic */}
                <td className="px-4 py-2">
                  <Badge variant="outline">
                    <span className="mr-1">{topicInfo.icon}</span>
                    {topicInfo.label}
                  </Badge>
                </td>

                {/* Title */}
                <td className="px-4 py-2 font-medium">{thread.title}</td>

                {/* Date Created */}
                <td className="px-4 py-2 text-muted-foreground">
                  {thread.createdAt.toLocaleDateString()}
                </td>

                <td className="px-4 py-2">
                  <div className="flex items-center">
                    {participants.slice(0, 3).map((name, idx) => (
                      <AvatarName
                        // key guarantees stable list rendering
                        key={`${thread.id}-participant-${idx}`}
                        name={name}
                        size="sm"
                        showName={false}
                        // negative margin on every avatar *after* the first
                        className={cn(idx > 0 && "-ml-2")}
                      />
                    ))}
                    {participants.length > 3 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        +{participants.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Summary */}
                <td
                  className="px-4 py-2 max-w-xs truncate whitespace-nowrap overflow-hidden text-ellipsis"
                  title={thread.summary ?? "No summary generated yet."}
                >
                  {thread.summary ?? "No summary generated yet."}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ThreadsTable;
