
import React, { useState, useEffect } from "react";
import ChatContainer from "@/components/ChatContainer";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@/types/message";

const Demo = () => {
  const [demoThreadId, setDemoThreadId] = useState<string>(uuidv4());
  const [isLoading, setIsLoading] = useState(false);
  const [ephemeralMessages, setEphemeralMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const addEphemeralMessage = (message: Message) => {
    setEphemeralMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    // Reset messages when component mounts
    setEphemeralMessages([]);
    // Generate a new thread ID each time (no database persistence)
    setDemoThreadId(uuidv4());
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Nest Demo</h1>
      <p className="text-muted-foreground text-center mb-6">
        A safe place for parenting communication.
        <span className="block text-sm italic mt-1">
          (Demo messages are ephemeral and will be lost on refresh or navigation)
        </span>
      </p>
      <ChatContainer 
        user1="Alice" 
        user2="Bob" 
        threadId={demoThreadId}
        ephemeralMode={true}
        ephemeralMessages={ephemeralMessages}
        onSendEphemeralMessage={addEphemeralMessage}
      />
    </div>
  );
};

export default Demo;
