
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import ChatContainer from "@/components/ChatContainer";
import type { Thread } from "@/types/thread";
import { useToast } from "@/hooks/use-toast";
import { getThread } from "@/services/threadService";

const ThreadView = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchThread = async () => {
      setIsLoading(true);
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
  }, [threadId, navigate, toast]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
