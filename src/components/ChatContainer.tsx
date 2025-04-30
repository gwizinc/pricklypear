
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatPanel from "./ChatPanel";
import type { Message } from "@/types/message";
import { getMessages } from "@/services/messageService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ChatContainerProps {
  user1: string;
  user2: string;
  threadId: string;
}

const ChatContainer = ({ user1, user2, threadId }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!threadId) {
      toast({
        title: "Error",
        description: "Thread ID is required",
        variant: "destructive",
      });
      navigate("/threads");
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      const fetchedMessages = await getMessages(threadId);
      setMessages(fetchedMessages);
      setIsLoading(false);
    };

    fetchMessages();
  }, [threadId, navigate, toast]);

  const handleSendMessage = async (sender: string, text: string) => {
    if (!threadId) {
      toast({
        title: "Error",
        description: "Cannot send messages outside of a thread",
        variant: "destructive",
      });
      return;
    }
    
    // Create optimistic update
    const tempId = uuidv4();
    const tempMessage: Message = {
      id: tempId,
      text,
      sender,
      timestamp: new Date(),
      threadId,
    };
    
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    
    // Actual save to database happens in ChatPanel after AI review
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-[85vh] rounded-lg overflow-hidden border shadow-md">
      {isLoading ? (
        <div className="col-span-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <ChatPanel
            messages={messages}
            currentUser={user1}
            bgColor="bg-chat-blue/20"
            onSendMessage={(text) => handleSendMessage(user1, text)}
            threadId={threadId}
          />
          <ChatPanel
            messages={messages}
            currentUser={user2}
            bgColor="bg-chat-purple/20"
            onSendMessage={(text) => handleSendMessage(user2, text)}
            threadId={threadId}
          />
        </>
      )}
    </div>
  );
};

export default ChatContainer;
