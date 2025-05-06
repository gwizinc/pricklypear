
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import type { Thread } from "@/types/thread";

interface ThreadMessageComposerProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  isThreadClosed: boolean;
  onSendMessage: () => void;
  onRequestClose: () => void;
  thread: Thread;
}

const ThreadMessageComposer = ({
  newMessage,
  setNewMessage,
  isSending,
  isThreadClosed,
  onSendMessage,
  onRequestClose,
  thread,
}: ThreadMessageComposerProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) sends the message
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (newMessage.trim() && !isSending && !isThreadClosed) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Textarea
          placeholder={isThreadClosed ? "Thread is closed" : "Type your message..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || isThreadClosed}
          className="flex-grow min-h-[80px]"
          rows={3}
        />
        <Button 
          onClick={onSendMessage} 
          disabled={!newMessage.trim() || isSending || isThreadClosed}
          className="self-end"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="ml-2">Send</span>
        </Button>
      </div>
      {!isThreadClosed && !thread.closeRequestedBy && (
        <button 
          onClick={onRequestClose}
          disabled={isSending}
          className="text-muted-foreground text-sm hover:text-blue-500 hover:underline transition-colors text-left"
        >
          Request thread to be closed
        </button>
      )}
    </div>
  );
};

export default ThreadMessageComposer;
