
import React, { useState, useEffect } from "react";
import { MessageCirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getThreads } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import type { Thread } from "@/types/thread";
import ThreadsList from "@/components/ThreadsList";
import CreateThreadDialog from "@/components/CreateThreadDialog";

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      if (user) {
        const fetchedThreads = await getThreads();
        setThreads(fetchedThreads);
      }
      setIsLoading(false);
    };

    fetchThreads();
  }, [user]);

  const handleThreadCreated = (newThread: Thread) => {
    setThreads(prevThreads => [newThread, ...prevThreads]);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Threads</h1>
        
        {user && (
          <CreateThreadDialog 
            onThreadCreated={handleThreadCreated}
            user={user}
          />
        )}
      </div>

      <ThreadsList 
        threads={threads}
        isLoading={isLoading}
        user={user}
        onNewThreadClick={() => setIsDialogOpen(true)}
      />
    </div>
  );
};

export default Threads;
