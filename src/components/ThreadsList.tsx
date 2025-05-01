
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThreadCard from "./ThreadCard";
import type { Thread } from "@/types/thread";

interface ThreadsListProps {
  threads: Thread[];
  isLoading: boolean;
  user: any;
  onNewThreadClick: () => void;
}

const ThreadsList = ({ threads, isLoading, user, onNewThreadClick }: ThreadsListProps) => {
  // Filter threads by status
  const openThreads = threads.filter(thread => thread.status === 'open');
  const closedThreads = threads.filter(thread => thread.status === 'closed');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Sign in to view your threads</h3>
        <p className="text-muted-foreground mb-4">
          Create an account or sign in to start conversations.
        </p>
        <Button asChild>
          <Link to="/auth" className="flex gap-2 items-center">
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </Button>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/demo">Try the Demo</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No threads yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first thread to start a conversation.
        </p>
        <Button onClick={onNewThreadClick}>
          Create Thread
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Open Threads Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          Open Threads
          {openThreads.length > 0 && (
            <Badge variant="outline" className="ml-2">{openThreads.length}</Badge>
          )}
        </h2>
        
        {openThreads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No open threads</p>
          </div>
        )}
      </section>
      
      {/* Closed Threads Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          Closed Threads
          {closedThreads.length > 0 && (
            <Badge variant="outline" className="ml-2">{closedThreads.length}</Badge>
          )}
        </h2>
        
        {closedThreads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No closed threads</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ThreadsList;
