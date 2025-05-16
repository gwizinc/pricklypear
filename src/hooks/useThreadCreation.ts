import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createThread } from "@/services/threadService";
import type { User } from "@supabase/supabase-js";
import type { Thread } from "@/types/thread";
import type { ThreadTopic } from "@/constants/thread-topics";

export const useThreadCreation = (
  onThreadCreated: (thread: Thread) => void,
  onClose: () => void,
) => {
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<ThreadTopic>("other");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateThread = async (user: User) => {
    // Always work with a trimmed version of the title
    const trimmedTitle = newThreadTitle.trim();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create threads",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!trimmedTitle) {
      toast({
        title: "Title required",
        description: "Please enter a title for the thread",
        variant: "destructive",
      });
      return;
    }

    // DD-55: enforce 50-character limit before service call
    if (trimmedTitle.length > 50) {
      toast({
        title: "Title too long",
        description: "Thread titles must be 50 characters or fewer.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedContactId) {
      toast({
        title: "Contact required",
        description: "Please select a contact for the thread",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    const newThread = await createThread(
      trimmedTitle,
      [selectedContactId],
      selectedTopic,
    );

    setIsCreating(false);

    if (newThread) {
      onThreadCreated(newThread);
      setNewThreadTitle("");
      setSelectedContactId("");
      setSelectedTopic("other");
      onClose();
      // Redirect the user to the newly-created thread
      navigate(`/threads/${newThread.id}`);

      toast({
        title: "Thread created",
        description: `"${trimmedTitle}" has been created successfully.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create thread. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    newThreadTitle,
    setNewThreadTitle,
    selectedContactId,
    setSelectedContactId,
    selectedTopic,
    setSelectedTopic,
    isCreating,
    handleCreateThread,
  };
};
