
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatPanel from "./ChatPanel";
import type { Message } from "@/types/message";

interface ChatContainerProps {
  user1: string;
  user2: string;
}

const ChatContainer = ({ user1, user2 }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "Hey there! How's it going?",
      sender: user1,
      timestamp: new Date(Date.now() - 60000 * 15),
    },
    {
      id: uuidv4(),
      text: "Pretty good! Just checking out this new chat interface. What do you think?",
      sender: user2,
      timestamp: new Date(Date.now() - 60000 * 14),
    },
    {
      id: uuidv4(),
      text: "I think it looks great! Really clean design.",
      sender: user1,
      timestamp: new Date(Date.now() - 60000 * 10),
    },
  ]);

  const handleSendMessage = (sender: string, text: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-[85vh] rounded-lg overflow-hidden border shadow-md">
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
    </div>
  );
};

export default ChatContainer;
