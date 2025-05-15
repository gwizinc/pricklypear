import React, { useRef, useEffect } from "react";
import MessageBubble from "@/components/MessageBubble";
import type { Message } from "@/types/message";
import { useAuth } from "@/contexts/AuthContext";
import { markMessagesAsRead } from "@/services/messageService";
import type { User } from "@supabase/supabase-js";
import { MessageCircle } from "lucide-react";
import type { Thread } from "@/types/thread";

interface ThreadMessagesProps {
  messages: Message[];
  user: User | null;
  thread: Thread;
}

const ThreadMessages: React.FC<ThreadMessagesProps> = ({ 
  messages, 
  user, 
  thread,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user: authUser } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when they are displayed
  useEffect(() => {
    if (user && messages.length > 0) {
      // Get message IDs that aren't from the current user
      const otherUserMessageIds = messages
        .filter((message) => !message.isCurrentUser && !message.isSystem)
        .map((message) => message.id);

      if (otherUserMessageIds.length > 0) {
        markMessagesAsRead(otherUserMessageIds);
      }
    }
  }, [messages, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-grow overflow-y-auto px-4 py-6 border rounded-md mb-4 bg-white dark:bg-transparent">
      {messages.length > 0 ? (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </>
      ) : (
        <div className="text-center text-muted-foreground/60 py-8">
          <div className="flex flex-col items-center gap-2">
            <MessageCircle className="h-12 w-12" />
            <p className="italic">No messages yet. Start the conversation below.</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ThreadMessages;
