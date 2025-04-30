
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatPanel from "./ChatPanel";
import type { Message } from "@/types/message";
import { getMessages, saveMessage } from "@/services/messageService";
import { useToast } from "@/hooks/use-toast";

interface ChatContainerProps {
  user1: string;
  user2: string;
}

const ChatContainer = ({ user1, user2 }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const fetchedMessages = await getMessages();
      setMessages(fetchedMessages);
      setIsLoading(false);
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async (sender: string, text: string) => {
    // Create optimistic update
    const tempId = uuidv4();
    const tempMessage: Message = {
      id: tempId,
      text,
      sender,
      timestamp: new Date(),
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
          />
          <ChatPanel
            messages={messages}
            currentUser={user2}
            bgColor="bg-chat-purple/20"
            onSendMessage={(text) => handleSendMessage(user2, text)}
          />
        </>
      )}
    </div>
  );
};

export default ChatContainer;
