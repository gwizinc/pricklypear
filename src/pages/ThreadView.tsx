
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChatContainer from "@/components/ChatContainer";
import type { Thread } from "@/types/thread";
import { useToast } from "@/hooks/use-toast";

const ThreadView = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, we would fetch the thread from the server
    // For now, we'll create a mock thread
    setTimeout(() => {
      if (threadId) {
        setThread({
          id: threadId,
          title: `Thread ${threadId.slice(0, 5)}`,
          createdAt: new Date(),
          participants: ["Alice", "Bob"]
        });
      }
      setIsLoading(false);
    }, 500);
  }, [threadId]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!thread) {
    toast({
      title: "Thread not found",
      description: "The thread you're looking for doesn't exist.",
      variant: "destructive",
    });
    navigate("/threads");
    return null;
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
