
import React, { useState, useEffect } from "react";
import ChatContainer from "@/components/ChatContainer";
import { createThread, getThreads } from "@/services/threadService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Demo = () => {
  const [demoThreadId, setDemoThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const setupDemoThread = async () => {
      try {
        // First check if we have any threads
        const threads = await getThreads();
        let demoThread = threads.find(t => t.title === "Demo Conversation");
        
        // If no demo thread exists, create one
        if (!demoThread) {
          demoThread = await createThread(
            "Demo Conversation", 
            ["Alice", "Bob"]
          );
          
          if (!demoThread) {
            throw new Error("Failed to create demo thread");
          }
        }
        
        setDemoThreadId(demoThread.id);
      } catch (error) {
        console.error("Error setting up demo thread:", error);
        toast({
          title: "Error",
          description: "Failed to set up demo conversation",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    setupDemoThread();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Nest Demo</h1>
      <p className="text-muted-foreground text-center mb-6">A safe place for parenting communication.</p>
      {demoThreadId && (
        <ChatContainer user1="Alice" user2="Bob" threadId={demoThreadId} />
      )}
    </div>
  );
};

export default Demo;
