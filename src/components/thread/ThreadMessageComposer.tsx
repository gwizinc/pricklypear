
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";

interface ThreadMessageComposerProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  isThreadClosed: boolean;
  onSendMessage: () => void;
}

const ThreadMessageComposer = ({
  newMessage,
  setNewMessage,
  isSending,
  isThreadClosed,
  onSendMessage,
}: ThreadMessageComposerProps) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder={isThreadClosed ? "Thread is closed" : "Type your message..."}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
        disabled={isSending || isThreadClosed}
        className="flex-grow"
      />
      <Button 
        onClick={onSendMessage} 
        disabled={!newMessage.trim() || isSending || isThreadClosed}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="ml-2">Send</span>
      </Button>
    </div>
  );
};

export default ThreadMessageComposer;
