import React from "react";
import type { Message } from "@/types/message.js";
import MessageBubble from "@/components/MessageBubble";

interface Props {
  messages: Message[];
}

const SearchThreadMessages = ({ messages }: Props) => (
  <div className="flex flex-col">
    {messages.map((msg) =>
      msg.isSystem ? (
        <div
          key={msg.id}
          className="mb-2 w-full self-center rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground"
        >
          {msg.text}
        </div>
      ) : (
        <MessageBubble key={msg.id} message={msg} />
      ),
    )}
  </div>
);

export default SearchThreadMessages;
