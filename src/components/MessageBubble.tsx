
import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import { RotateCcw, Check, CheckCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isSystemMessage = message.isSystem;

  const showReadReceipt = !isSystemMessage;
  
  const allRead = showReadReceipt && message.readReceipts && 
    message.readReceipts.every(receipt => receipt.readAt !== null);
  
  const formatReadReceiptTooltip = () => {
    if (!message.readReceipts || message.readReceipts.length === 0) {
      return "No read information";
    }
    
    return (
      <div className="space-y-1">
        {message.readReceipts.map((receipt, index) => (
          <div key={index}>
            <span className="font-semibold">{receipt.userId.split('@')[0]}</span>: 
            {receipt.readAt 
              ? ` Read at ${format(new Date(receipt.readAt), "MMM d, h:mm a")}` 
              : " Not read yet"}
          </div>
        ))}
      </div>
    );
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
          
          {showReadReceipt && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-1">
                    {allRead ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3 text-muted-foreground" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {formatReadReceiptTooltip()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
