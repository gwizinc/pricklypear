
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MessageCirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createThread } from "@/services/threadService";
import { getConnections } from "@/services/connections";
import type { Connection } from "@/types/connection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateThreadDialogProps {
  onThreadCreated: (newThread: any) => void;
  user: any;
}

const CreateThreadDialog = ({ onThreadCreated, user }: CreateThreadDialogProps) => {
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadConnections = async () => {
    if (!user) return;
    
    setIsLoadingContacts(true);
    try {
      const acceptedConnections = await getConnections();
      setConnections(acceptedConnections.filter(conn => conn.status === 'accepted'));
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      loadConnections();
      setNewThreadTitle("");
      setSelectedContact("");
    }
  };

  const handleCreateThread = async () => {
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
      setIsDialogOpen(false);
      
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageCirclePlus className="mr-2 h-4 w-4" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>
            Give your conversation thread a name and select a contact to chat with.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <Input
            placeholder="Thread title"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
          />
          
          <div>
            <label className="text-sm font-medium mb-1 block">
              Select Contact
            </label>
            
            {isLoadingContacts ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                <span className="text-sm">Loading contacts...</span>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-2 border border-dashed rounded-md">
                <p className="text-sm text-muted-foreground">
                  No contacts available. Add contacts first.
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  asChild 
                  className="mt-1"
                >
                  <Link to="/connections">Go to Connections</Link>
                </Button>
              </div>
            ) : (
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((connection) => (
                    <SelectItem key={connection.otherUserId} value={connection.username}>
                      {connection.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateThread} 
            disabled={!newThreadTitle.trim() || !selectedContact || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;
