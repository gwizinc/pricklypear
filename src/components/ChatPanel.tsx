
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageReviewDialog from "./MessageReviewDialog";
import { reviewMessage } from "@/utils/messageReview";
import { saveMessage } from "@/services/messageService";
import type { Message } from "@/types/message";
import { useToast } from "@/hooks/use-toast";

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
  const [inputValue, setInputValue] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  const [kindMessage, setKindMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      setOriginalMessage(inputValue.trim());
      setIsProcessing(true);
      
      try {
        // Get AI rephrasing
        const rephrasedMessage = await reviewMessage(inputValue.trim());
        setKindMessage(rephrasedMessage);
        
        // Open review dialog
        setIsReviewDialogOpen(true);
      } catch (error) {
        console.error("Error processing message:", error);
        // Fallback to original message
        setKindMessage(inputValue.trim());
        setIsReviewDialogOpen(true);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSendMessage = async (finalMessage: string) => {
    // First call parent's onSendMessage for immediate UI update
    onSendMessage(finalMessage);
    
    try {
      // Then save to database (both original and AI versions)
      await saveMessage(currentUser, originalMessage, kindMessage, finalMessage);
    } catch (error) {
      console.error("Failed to save message to database:", error);
      toast({
        title: "Error",
        description: "Failed to save message to database",
        variant: "destructive",
      });
    }
    
    // Reset form
    setInputValue("");
    setOriginalMessage("");
    setKindMessage("");
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
          disabled={isProcessing}
        />
        <Button type="submit" size="icon" disabled={!inputValue.trim() || isProcessing}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Message review dialog */}
      <MessageReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        originalMessage={originalMessage}
        kindMessage={kindMessage}
        onAccept={handleSendMessage}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default ChatPanel;
