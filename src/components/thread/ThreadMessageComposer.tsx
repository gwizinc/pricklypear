import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Plus, Mic } from "lucide-react";

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
  const [autoAccept, setAutoAccept] = useState(false);

  // Initialise from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("autoAcceptAISuggestions");
    setAutoAccept(stored === "true");
  }, []);

  const handleToggleAutoAccept = (value: boolean) => {
    setAutoAccept(value);
    localStorage.setItem("autoAcceptAISuggestions", value.toString());
  };

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
    <div className="relative bg-white dark:bg-transparent border rounded-md">
      <Textarea
        placeholder={
          isThreadClosed ? "Thread is closed" : "Type your message..."
        }
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending || isThreadClosed}
        className="w-full min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-4 pt-4"
        rows={1}
      />
      <div className="flex justify-between items-center px-4 pb-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            disabled={isThreadClosed}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            disabled={isThreadClosed}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Switch
                    id="auto-accept-toggle"
                    checked={autoAccept}
                    disabled={isThreadClosed}
                    onCheckedChange={handleToggleAutoAccept}
                  />
                  <Label
                    htmlFor="auto-accept-toggle"
                    className="cursor-pointer select-none"
                  >
                    Auto-accept AI suggestions
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                Automatically send the AI-reviewed message without opening the
                review dialog.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || isSending || isThreadClosed}
            size="icon"
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThreadMessageComposer;
