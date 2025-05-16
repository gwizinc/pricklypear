import React, { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import ThreadsList from "@/components/ThreadsList";
import ThreadsTable from "@/components/ThreadsTable";
import CreateThreadDialog from "@/components/thread/CreateThreadDialog";
import { useAuth } from "@/contexts/AuthContext";
import { getThreads } from "@/services/threadService";
import type { Thread } from "@/types/thread";
import { cn } from "@/lib/utils";

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Default is now "table" per spec.
  const [view, setView] = useState<"cards" | "table">("table");

  const { user } = useAuth();

  // Load persisted view preference on mount.
  useEffect(() => {
    const stored = localStorage.getItem("threads.view");
    if (stored === "cards" || stored === "table") {
      setView(stored);
    }
  }, []);

  // Fetch threads when the user becomes available.
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
    setThreads((prev) => [newThread, ...prev]);
  };

  const handleOpenCreateDialog = () => setIsDialogOpen(true);

  const handleViewChange = (value: "cards" | "table") => {
    setView(value);
    localStorage.setItem("threads.view", value);
  };

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Threads</h1>

        <div className="flex items-center gap-3">
          {/* View switch with icons */}
          <div className="flex items-center gap-2">
            <List
              className={cn(
                "h-4 w-4",
                view === "table" ? "text-primary" : "text-muted-foreground",
              )}
            />
            <Switch
              id="thread-view-toggle"
              aria-label="Toggle thread view"
              checked={view === "cards"}
              aria-checked={view === "cards"}
              onCheckedChange={(checked) =>
                handleViewChange(checked ? "cards" : "table")
              }
            />
            <LayoutGrid
              className={cn(
                "h-4 w-4",
                view === "cards" ? "text-primary" : "text-muted-foreground",
              )}
            />
          </div>

          {user && (
            <CreateThreadDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              user={user}
              onThreadCreated={handleThreadCreated}
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
