
import React, { useRef, useEffect } from "react";
import MessageBubble from "@/components/MessageBubble";
import type { Message } from "@/types/message";
import { useAuth } from "@/contexts/AuthContext";
import { markMessagesAsRead } from "@/services/messageService";

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

  // Mark messages as read when they are displayed
  useEffect(() => {
    if (user && messages.length > 0) {
      // Get message IDs that aren't from the current user
      const otherUserMessageIds = messages
        .filter(message => !message.isCurrentUser && !message.isSystem)
        .map(message => message.id);
      
      if (otherUserMessageIds.length > 0) {
        markMessagesAsRead(otherUserMessageIds);
      }
    }
  }, [messages, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  return (
    <div className="flex-grow overflow-y-auto px-2 py-4 border rounded-md mb-4">
      {messages.length > 0 ? (
        messages.map((message) => (
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
