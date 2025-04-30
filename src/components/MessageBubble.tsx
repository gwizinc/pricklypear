
import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageBubble = ({ message, isCurrentUser }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex flex-col max-w-[80%] mb-2 animate-message-appear",
        isCurrentUser ? "self-end items-end" : "self-start items-start"
      )}
    >
      <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
        <span>{message.sender}</span>
        <span>•</span>
        <span>{format(message.timestamp, "h:mm a")}</span>
      </div>
      <div
        className={cn(
          "px-4 py-2 rounded-2xl shadow-sm",
          isCurrentUser
            ? "bg-chat-sender1 text-white rounded-tr-none"
            : "bg-chat-gray rounded-tl-none"
        )}
      >
        {message.text}
      </div>
    </div>
  );
};

export default MessageBubble;
