import React, { useState, useEffect } from "react";
import { LayoutGrid, List } from "lucide-react";

import { getThreads } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import type { Thread } from "@/types/thread";
import ThreadsList from "@/components/ThreadsList";
import ThreadsTable from "@/components/ThreadsTable";
import CreateThreadDialog from "@/components/thread/CreateThreadDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<"cards" | "table">("cards");
  const { user } = useAuth();

  // Load persisted view preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("threads.view");
    if (stored === "cards" || stored === "table") {
      setView(stored);
    }
  }, []);

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
    setThreads((prevThreads) => [newThread, ...prevThreads]);
  };

  const handleOpenCreateDialog = () => {
    setIsDialogOpen(true);
  };

  const handleViewChange = (value: string) => {
    if (value === "cards" || value === "table") {
      setView(value);
      localStorage.setItem("threads.view", value);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Threads</h1>

        <div className="flex items-center gap-3">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={handleViewChange}
            variant="outline"
          >
            <ToggleGroupItem value="cards" aria-label="Card view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {user && (
            <CreateThreadDialog
              onThreadCreated={handleThreadCreated}
              user={user}
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          )}
        </div>
      </div>

      {view === "cards" ? (
        <ThreadsList
          threads={threads}
          isLoading={isLoading}
          user={user}
          onNewThreadClick={handleOpenCreateDialog}
        />
      ) : (
        <ThreadsTable threads={threads} isLoading={isLoading} />
      )}
    </div>
  );
};

export default Threads;
