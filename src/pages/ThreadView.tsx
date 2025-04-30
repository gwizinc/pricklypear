
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogIn, Edit2 } from "lucide-react";
import ChatContainer from "@/components/ChatContainer";
import type { Thread } from "@/types/thread";
import { useToast } from "@/hooks/use-toast";
import { getThread, updateThreadSummary } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ThreadView = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [newSummary, setNewSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchThread = async () => {
      setIsLoading(true);
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (threadId) {
        const fetchedThread = await getThread(threadId);
        if (fetchedThread) {
          setThread(fetchedThread);
          setNewSummary(fetchedThread.summary || "");
        } else {
          toast({
            title: "Thread not found",
            description: "The thread you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate("/threads");
        }
      }
      setIsLoading(false);
    };

    fetchThread();
  }, [threadId, navigate, toast, user]);

  const handleSaveSummary = async () => {
    if (!threadId) return;
    
    setIsSaving(true);
    const success = await updateThreadSummary(threadId, newSummary);
    setIsSaving(false);
    
    if (success) {
      if (thread) {
        setThread({
          ...thread,
          summary: newSummary
        });
      }
      setSummaryDialogOpen(false);
      toast({
        title: "Summary updated",
        description: "Thread summary has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update thread summary. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Sign in to view this thread</h3>
          <p className="text-muted-foreground mb-4">
            You must be signed in to view and participate in threads.
          </p>
          <Button asChild>
            <Link to="/auth" className="flex gap-2 items-center">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link to="/demo">Try the Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return null; // This should not happen as we navigate away if thread is not found
  }

  // Find the other participant in the conversation
  const otherParticipant = thread.participants.find(participant => participant !== user.email?.split('@')[0]);
  // Current user is derived from the email
  const currentUser = user.email?.split('@')[0] || '';

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{thread.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={thread.status === 'open' ? 'default' : 'secondary'}>
              {thread.status === 'open' ? 'Open' : 'Closed'}
            </Badge>
            <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  {thread.summary ? "Edit Summary" : "Add Summary"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{thread.summary ? "Edit Thread Summary" : "Add Thread Summary"}</DialogTitle>
                  <DialogDescription>
                    Write a brief summary of this conversation to help identify it later.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Summarize the conversation..."
                  className="min-h-[100px]"
                />
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setSummaryDialogOpen(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSummary} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Summary"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Conversation with {otherParticipant}
          </p>
          {thread.summary && (
            <div className="bg-muted p-3 rounded-md mt-2">
              <p className="text-sm font-medium">Summary:</p>
              <p className="text-sm text-muted-foreground mt-1">{thread.summary}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="h-[80vh] rounded-lg overflow-hidden border shadow-md">
        {currentUser && otherParticipant && (
          <ChatContainer 
            user1={currentUser}
            user2={otherParticipant} 
            threadId={thread.id}
            singleUserMode={true}
            currentUserEmail={user.email || ''}
          />
        )}
      </div>
    </div>
  );
};

export default ThreadView;
