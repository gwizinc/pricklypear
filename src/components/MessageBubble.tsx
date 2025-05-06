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

  // Read-receipt helpers
  const isRead = Boolean(message.isRead);
  const readers = message.readBy?.length ? message.readBy.join(", ") : "Recipient";
  const readTimestamp = message.readAt ? format(message.readAt, "PPpp") : "";
  const tooltipText = isRead
    ? `${readers}${message.readAt ? ` • ${readTimestamp}` : ""}`
    : readers;

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
          <span>{message.isCurrentUser ? "You" : message.sender}</span>
          <span>•</span>
          <span>{format(message.timestamp, "h:mm a")}</span>

          {/* Read-receipt icon with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {isRead ? (
                  <CheckCheck className="h-3 w-3 text-black" />
                ) : (
                  <Check className="h-3 w-3 text-gray-400" />
                )}
              </TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
