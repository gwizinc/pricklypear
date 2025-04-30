
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCirclePlus, Loader2, LogIn } from "lucide-react";
import type { Thread } from "@/types/thread";
import { useToast } from "@/hooks/use-toast";
import { createThread, getThreads } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleCreateThread = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create threads",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!newThreadTitle.trim()) return;
    
    setIsCreating(true);
    
    const newThread = await createThread(
      newThreadTitle,
      ["Alice", "Bob"] // Default participants for now
    );
    
    setIsCreating(false);
    
    if (newThread) {
      setThreads(prevThreads => [newThread, ...prevThreads]);
      setNewThreadTitle("");
      setIsDialogOpen(false);
      
      toast({
        title: "Thread created",
        description: `"${newThreadTitle}" has been created successfully.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create thread. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <MessageCirclePlus className="mr-2 h-4 w-4" />
            New Thread
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Threads</h1>
        
        {user && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageCirclePlus className="mr-2 h-4 w-4" />
                New Thread
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Thread</DialogTitle>
                <DialogDescription>
                  Give your conversation thread a name to help you identify it later.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Thread title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="mt-2"
              />
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateThread} 
                  disabled={!newThreadTitle.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

const ThreadCard = ({ thread }: { thread: Thread }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{thread.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Created {thread.createdAt.toLocaleDateString()}
        </p>
        <p className="text-sm">
          Participants: {thread.participants.join(", ")}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/threads/${thread.id}`}>
            View Conversation
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Threads;
