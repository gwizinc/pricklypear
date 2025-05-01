
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Thread } from "@/types/thread";

interface ThreadCardProps {
  thread: Thread;
}

const ThreadCard = ({ thread }: ThreadCardProps) => {
  const topicLabels: Record<string, string> = {
    'travel': '✈️ Travel',
    'parenting_time': '👨‍👩‍👧 Parenting Time',
    'health': '🏥 Health',
    'education': '🎓 Education',
    'activity': '🏃 Activity',
    'legal': '⚖️ Legal',
    'other': '📝 Other'
  };

  const topicLabel = thread.topic && topicLabels[thread.topic] 
    ? topicLabels[thread.topic]
    : topicLabels.other;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{thread.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{topicLabel}</Badge>
            <Badge variant={thread.status === 'open' ? 'default' : 'secondary'}>
              {thread.status === 'open' ? 'Open' : 'Closed'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground mt-1">
              {thread.summary ? thread.summary : "No summary generated yet."}
            </p>
          </div>
          {thread.participants && thread.participants.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Participants:</p>
              <p className="text-sm text-muted-foreground">
                {thread.participants.join(', ')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/threads/${thread.id}`}>
            View Conversation
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Created {thread.createdAt.toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ThreadCard;
