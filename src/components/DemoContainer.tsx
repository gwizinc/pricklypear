
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import DemoChat from "./DemoChat";
import type { Message } from "@/types/message";
import { useToast } from "@/hooks/use-toast";

interface DemoContainerProps {
  user1: string;
  user2: string;
}

const DemoContainer = ({ user1, user2 }: DemoContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const handleSendMessage = (sender: string, text: string) => {
    // Create new message
    const newMessage: Message = {
      id: uuidv4(),
      text: text,
      sender: sender,
      timestamp: new Date(),
      threadId: 'demo-thread',
      original_text: text,
      kind_text: text,
    };
    
    // Update messages
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-[85vh] rounded-lg overflow-hidden border shadow-md">
      <DemoChat
        currentUser={user1}
        otherUser={user2}
        messages={messages}
        bgColor="bg-chat-blue/20"
        onSendMessage={handleSendMessage}
      />
      <DemoChat
        currentUser={user2}
        otherUser={user1}
        messages={messages}
        bgColor="bg-chat-purple/20"
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default DemoContainer;
