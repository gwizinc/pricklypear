
import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import { RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const hasOriginalText = message.original_text && message.original_text !== message.text;
  const isSystemMessage = message.isSystem;

  const toggleOriginalText = () => {
    setShowOriginal(prev => !prev);
  };

  return (
    <div
      className={cn(
        "flex flex-col mb-2 animate-message-appear",
        isSystemMessage ? "self-center items-center w-full" : 
        message.isCurrentUser ? "self-end items-end" : "self-start items-start"
      )}
    >
      {!isSystemMessage && (
        <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
          <span>{message.isCurrentUser ? 'You' : message.sender}</span>
          <span>•</span>
          <span>{format(message.timestamp, "h:mm a")}</span>
        </div>
      )}
      
      <div className="flex items-start gap-1">
        <div
          className={cn(
            "px-4 py-2 rounded-2xl shadow-sm",
            isSystemMessage 
              ? "bg-muted text-muted-foreground w-full text-center"
              : message.isCurrentUser
                ? "bg-chat-sender1 text-white rounded-tr-none"
                : "bg-chat-gray rounded-tl-none"
          )}
        >
          {showOriginal && hasOriginalText ? message.original_text : message.text}
        </div>
        
        {message.isCurrentUser && hasOriginalText && !isSystemMessage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={toggleOriginalText} 
                  className={cn(
                    "p-1 rounded-full hover:bg-gray-200 transition-colors",
                    showOriginal && "bg-gray-200"
                  )}
                >
                  <RotateCcw className="h-4 w-4 text-gray-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showOriginal ? "Show AI rephrased message" : "Show original message"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
