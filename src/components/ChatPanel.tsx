
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageReviewDialog from "./MessageReviewDialog";
import { reviewMessage } from "@/utils/messageReview";
import { saveMessage } from "@/services/messageService";
import type { Message } from "@/types/message";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ChatPanelProps {
  messages: Message[];
  currentUser: string;
  bgColor: string;
  onSendMessage: (text: string) => void;
  threadId: string;
  ephemeralMode?: boolean;
  otherUser?: string;
}

const ChatPanel = ({ 
  messages, 
  currentUser, 
  bgColor, 
  onSendMessage,
  threadId,
  ephemeralMode = false,
  otherUser
}: ChatPanelProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  const [kindMessage, setKindMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!threadId) {
      toast({
        title: "Error",
        description: "Cannot send messages outside of a thread",
        variant: "destructive",
      });
      navigate("/threads");
      return;
    }
    
    if (inputValue.trim()) {
      setOriginalMessage(inputValue.trim());
      setIsProcessing(true);
      
      try {
        // Show toast notification that rephrasing is in progress
        toast({
          title: "Processing message",
          description: "AI is suggesting a kinder phrasing...",
        });
        
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
        
        toast({
          title: "Error",
          description: "Could not generate AI suggestion. Using original message.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSendMessage = async (finalMessage: string) => {
    if (!threadId) {
      toast({
        title: "Error",
        description: "Cannot send messages outside of a thread",
        variant: "destructive",
      });
      return;
    }
    
    // First call parent's onSendMessage for immediate UI update
    onSendMessage(finalMessage);
    
    // Only save to database if not in ephemeral mode
    if (!ephemeralMode) {
      try {
        // Then save to database (both original and AI versions)
        const messageId = await saveMessage(currentUser, originalMessage, kindMessage, finalMessage, threadId);
        
        if (!messageId) {
          toast({
            title: "Error",
            description: `Failed to save message. User "${currentUser}" may not exist in the database.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to save message to database:", error);
        toast({
          title: "Error",
          description: "Failed to save message to database",
          variant: "destructive",
        });
      }
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

  // Filter messages to show the conversation view (both users' messages)
  const conversationMessages = messages;

  return (
    <div className={`flex flex-col h-full ${bgColor}`}>
      <div className="p-4 border-b flex justify-between items-center">
        {otherUser && (
          <div className="text-sm text-muted-foreground">
            Chatting with {otherUser}
          </div>
        )}
        <div></div> {/* Empty div to maintain the space between elements */}
      </div>
      
      {/* Messages container with scrolling */}
      <div className="flex-1 overflow-y-auto p-4 chat-scrollbar">
        <div className="flex flex-col">
          {conversationMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.sender === currentUser}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area with loading indicator */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isProcessing ? "Processing message..." : "Type your message..."}
          className="flex-1"
          disabled={isProcessing}
        />
        <Button type="submit" size="icon" disabled={!inputValue.trim() || isProcessing}>
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
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
