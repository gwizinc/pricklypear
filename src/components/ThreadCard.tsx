
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationBadge from "@/components/ui/notification-badge";
import type { Thread } from "@/types/thread";

interface ThreadCardProps {
  thread: Thread;
  unreadCount?: number;
}

const ThreadCard = ({ thread, unreadCount = 0 }: ThreadCardProps) => {
  const topicLabels: Record<string, { label: string, icon: string }> = {
    'travel': { label: 'Travel', icon: '✈️' },
    'parenting_time': { label: 'Parenting Time', icon: '👨‍👩‍👧' },
    'health': { label: 'Health', icon: '🏥' },
    'education': { label: 'Education', icon: '🎓' },
    'activity': { label: 'Activity', icon: '🏃' },
    'legal': { label: 'Legal', icon: '⚖️' },
    'other': { label: 'Other', icon: '📝' }
  };

  const topicInfo = thread.topic && topicLabels[thread.topic] 
    ? topicLabels[thread.topic]
    : topicLabels.other;

  return (
    <Card className="rounded-xl shadow-card hover:bg-bgLight transition-all hover-tilt">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-rounded text-primary relative">
            {thread.title}
            {unreadCount > 0 && (
              <span className="ml-2 bg-accent text-white text-xs font-medium rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1 font-medium">
              <span>{topicInfo.icon}</span> {topicInfo.label}
            </Badge>
            <Badge 
              variant={thread.status === 'open' ? 'default' : 'secondary'}
              className={`${thread.status === 'open' ? 'bg-secondary text-primary' : ''} pointer-events-none`}
            >
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
        <Button 
          asChild 
          variant="default" 
          className="w-full bg-secondary hover:bg-secondary/90 text-primary font-semibold relative"
        >
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
