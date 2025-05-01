
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import ThreadCard from "@/components/ThreadCard";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import type { Thread } from "@/types/thread";
import type { User } from "@supabase/supabase-js";

interface ThreadsListProps {
  threads: Thread[];
  isLoading: boolean;
  user: User | null;
  onNewThreadClick: () => void;
}

const ThreadsList = ({ threads, isLoading, user, onNewThreadClick }: ThreadsListProps) => {
  const { threadCounts } = useUnreadMessages();
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-6 text-lg">No threads found.</p>
        {user && (
          <Button onClick={onNewThreadClick} className="gap-2 bg-secondary hover:bg-secondary/90 text-primary font-semibold">
            <Plus className="h-5 w-5" />
            Start a new conversation
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {threads.map((thread) => (
        <ThreadCard 
          key={thread.id} 
          thread={thread} 
          unreadCount={threadCounts[thread.id] || 0}
        />
      ))}
      
      {user && (
        <div className="flex items-center justify-center min-h-64 border-2 border-dashed rounded-xl p-4 hover:border-secondary/60 transition-colors">
          <Button 
            onClick={onNewThreadClick} 
            variant="ghost" 
            className="flex flex-col gap-3 h-auto py-8 hover:bg-transparent"
          >
            <div className="rounded-full bg-secondary/20 p-4">
              <Plus className="h-8 w-8 text-secondary" />
            </div>
            <span className="text-lg font-semibold">Start a new conversation</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThreadsList;
