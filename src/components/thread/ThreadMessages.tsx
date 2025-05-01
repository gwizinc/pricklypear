
import React, { useRef, useEffect } from "react";
import MessageBubble from "@/components/MessageBubble";
import type { Message } from "@/types/message";
import { useAuth } from "@/contexts/AuthContext";

interface ThreadMessagesProps {
  messages: Message[];
  currentUser: string;
}

const ThreadMessages: React.FC<ThreadMessagesProps> = ({ messages, currentUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add isCurrentUser property to each message before rendering
  const displayMessages = messages.map(message => ({
    ...message,
    isCurrentUser: message.sender === currentUser
  }));

  return (
    <div className="flex-grow overflow-y-auto px-2 py-4 border rounded-md mb-4">
      {displayMessages.length > 0 ? (
        displayMessages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message}
          />
        ))
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No messages yet. Start the conversation!
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ThreadMessages;
