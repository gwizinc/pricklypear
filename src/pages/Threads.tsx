
import React, { useState, useEffect } from "react";
import { getThreads } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import type { Thread } from "@/types/thread";
import ThreadsList from "@/components/ThreadsList";
import CreateThreadDialog from "@/components/thread/CreateThreadDialog";

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

  const handleOpenCreateDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Threads</h1>
        
        {user && (
          <CreateThreadDialog 
            onThreadCreated={handleThreadCreated}
            user={user}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}
      </div>

      <ThreadsList 
        threads={threads}
        isLoading={isLoading}
        user={user}
        onNewThreadClick={handleOpenCreateDialog}
      />
    </div>
  );
};

export default Threads;
