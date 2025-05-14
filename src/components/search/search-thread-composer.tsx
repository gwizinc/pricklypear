import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchThread } from "@/contexts/search-thread-context.js";
import { Send } from "lucide-react";

const SearchThreadComposer = () => {
  const { addUserMessage, addSystemMessage } = useSearchThread();
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addUserMessage(trimmed);
    // Placeholder system response
    addSystemMessage({ text: "(search not implemented yet)" });
    setText("");
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        className="flex-1 resize-none rounded-md border p-2 text-sm"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your search…"
      />
      <Button size="icon" variant="ghost" onClick={handleSend}>
        <Send size={18} />
      </Button>
    </div>
  );
};

export default SearchThreadComposer;
