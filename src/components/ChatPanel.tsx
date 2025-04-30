
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import MessageBubble from "./MessageBubble";
import type { Message } from "@/types/message";

interface ChatPanelProps {
  messages: Message[];
  currentUser: string;
  bgColor: string;
  onSendMessage: (text: string) => void;
}

const ChatPanel = ({ 
  messages, 
  currentUser, 
  bgColor, 
  onSendMessage 
}: ChatPanelProps) => {
  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  // Scroll to bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`flex flex-col h-full ${bgColor}`}>
      <div className="p-4 border-b">
        <h3 className="font-medium">{currentUser}</h3>
      </div>
      
      {/* Messages container with scrolling */}
      <div className="flex-1 overflow-y-auto p-4 chat-scrollbar">
        <div className="flex flex-col">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.sender === currentUser}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
