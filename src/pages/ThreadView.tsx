
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import ChatContainer from "@/components/ChatContainer";
import type { Thread } from "@/types/thread";
import { useToast } from "@/hooks/use-toast";
import { getThread } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";

const ThreadView = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchThread = async () => {
      setIsLoading(true);
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (threadId) {
        const fetchedThread = await getThread(threadId);
        if (fetchedThread) {
          setThread(fetchedThread);
        } else {
          toast({
            title: "Thread not found",
            description: "The thread you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate("/threads");
        }
      }
      setIsLoading(false);
    };

    fetchThread();
  }, [threadId, navigate, toast, user]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Sign in to view this thread</h3>
          <p className="text-muted-foreground mb-4">
            You must be signed in to view and participate in threads.
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
      </div>
    );
  }

  if (!thread) {
    return null; // This should not happen as we navigate away if thread is not found
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/threads")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Threads
        </Button>
        <h1 className="text-3xl font-bold mb-2">{thread.title}</h1>
        <p className="text-muted-foreground">
          Conversation between {thread.participants.join(" and ")}
        </p>
      </div>
      
      <ChatContainer 
        user1={thread.participants[0]} 
        user2={thread.participants[1]} 
        threadId={thread.id}
      />
    </div>
  );
};

export default ThreadView;
