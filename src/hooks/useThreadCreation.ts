
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createThread } from "@/services/threadService";

export const useThreadCreation = (onThreadCreated: (thread: any) => void, onClose: () => void) => {
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateThread = async (user: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create threads",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!newThreadTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the thread",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedContact) {
      toast({
        title: "Contact required",
        description: "Please select a contact for the thread",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    const newThread = await createThread(
      newThreadTitle,
      [selectedContact]
    );
    
    setIsCreating(false);
    
    if (newThread) {
      onThreadCreated(newThread);
      setNewThreadTitle("");
      setSelectedContact("");
      onClose();
      
      toast({
        title: "Thread created",
        description: `"${newThreadTitle}" has been created successfully.`,
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
    selectedContact,
    setSelectedContact,
    isCreating,
    handleCreateThread
  };
};
