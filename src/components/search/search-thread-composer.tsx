import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchThread } from "@/contexts/search-thread-context.js";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client.js";

/**
 * Shape of the expected response from the `search-thread` Supabase edge
 * function.  Only the `answer`/`response` fields are consumed here.
 */
type SearchThreadResponse = {
  answer?: string;
  response?: string;
};

const SearchThreadComposer = () => {
  const { thread, addUserMessage, addSystemMessage } = useSearchThread();
  const [text, setText] = useState("");

  /**
   * Sends the user's query to the `search-thread` edge-function and appends the
   * system's reply (or an error message) to the current thread.
   */
  const handleSend = async (): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Immediately reflect the user's message in the UI.
    addUserMessage(trimmed);
    // Clear the composer.
    setText("");

    // Build the context payload for the edge-function call.
    const existingMessages = thread?.messages ?? [];
    const contextMessages = [
      ...existingMessages.map((m) => ({
        text: m.text,
        sender: m.isSystem ? "system" : m.isCurrentUser ? "user" : m.sender,
        timestamp:
          m.timestamp instanceof Date
            ? m.timestamp.toISOString()
            : new Date(m.timestamp).toISOString(),
      })),
      {
        text: trimmed,
        sender: "user",
        timestamp: new Date().toISOString(),
      },
    ];

    try {
      const { data, error } =
        await supabase.functions.invoke<SearchThreadResponse>("search-thread", {
          body: {
            query: trimmed,
            messages: contextMessages,
          },
        });

      if (error) {
        console.error("search-thread error", error);
        addSystemMessage({
          text: "Sorry, something went wrong while searching.",
        });
        return;
      }

      const answer = data?.answer ?? data?.response ?? "(No response)";
      addSystemMessage({ text: answer });
    } catch (e) {
      console.error("search-thread invocation failed", e);
      addSystemMessage({
        text: "Sorry, something went wrong while searching.",
      });
    }
  };

  /**
   * Handles keyboard shortcuts within the textarea.
   * Cmd/Ctrl + Enter triggers the same action as the send button.
   *
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} event
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        className="flex-1 resize-none rounded-md border p-2 text-sm"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your search…"
      />
      <Button size="icon" variant="ghost" onClick={handleSend}>
        <Send size={18} />
      </Button>
    </div>
  );
};

export default SearchThreadComposer;
