import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import type { Thread } from "@/types/thread";

interface ThreadsTableProps {
  threads: Thread[];
  isLoading: boolean;
}

/**
 * Returns the first up to two initials of a participant name.
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ThreadsTable: React.FC<ThreadsTableProps> = ({ threads, isLoading }) => {
  const { threadCounts } = useUnreadMessages();

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
          {sortedThreads.map((thread) => (
            <tr key={thread.id} className="hover:bg-muted/50">
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
              <td className="px-4 py-2 capitalize">{thread.topic}</td>

              {/* Title */}
              <td className="px-4 py-2 font-medium">{thread.title}</td>

              {/* Date Created */}
              <td className="px-4 py-2 text-muted-foreground">
                {thread.createdAt.toLocaleDateString()}
              </td>

              {/* Participants */}
              <td className="px-4 py-2">
                <div className="flex items-center">
                  {thread.participants?.slice(0, 3).map((name, idx) => (
                    <Avatar
                      key={`${thread.id}-participant-${idx}`}
                      className={`h-8 w-8 border-2 border-background ${
                        idx > 0 ? "-ml-2" : ""
                      }`}
                    >
                      <AvatarFallback className="text-xs">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {thread.participants && thread.participants.length > 3 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      +{thread.participants.length - 3}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ThreadsTable;
