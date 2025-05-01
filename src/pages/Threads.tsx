
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { MessageCirclePlus, Loader2, LogIn } from "lucide-react";
import type { Thread } from "@/types/thread";
import { useToast } from "@/hooks/use-toast";
import { createThread, getThreads } from "@/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import { getConnections } from "@/services/connections";
import type { Connection } from "@/types/connection";

const Threads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      if (user) {
        const fetchedThreads = await getThreads();
        setThreads(fetchedThreads);
      }
      setIsLoading(false);
    };

    fetchThreads();
  }, [user]);

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
      setThreads(prevThreads => [newThread, ...prevThreads]);
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Sign in to view your threads</h3>
          <p className="text-muted-foreground mb-4">
            Create an account or sign in to start conversations.
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
      );
    }

    if (threads.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No threads yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first thread to start a conversation.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <MessageCirclePlus className="mr-2 h-4 w-4" />
            New Thread
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Open Threads Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            Open Threads
            {openThreads.length > 0 && (
              <Badge variant="outline" className="ml-2">{openThreads.length}</Badge>
            )}
          </h2>
          
          {openThreads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No open threads</p>
            </div>
          )}
        </section>
        
        {/* Closed Threads Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            Closed Threads
            {closedThreads.length > 0 && (
              <Badge variant="outline" className="ml-2">{closedThreads.length}</Badge>
            )}
          </h2>
          
          {closedThreads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {closedThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No closed threads</p>
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Threads</h1>
        
        {user && (
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
                        onClick={() => setIsDialogOpen(false)}
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
        )}
      </div>

      {renderContent()}
    </div>
  );
};

const ThreadCard = ({ thread }: { thread: Thread }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{thread.title}</CardTitle>
          <Badge variant={thread.status === 'open' ? 'default' : 'secondary'}>
            {thread.status === 'open' ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Created {thread.createdAt.toLocaleDateString()}
          </p>
          <div className="mt-3">
            <p className="text-sm font-medium">Summary:</p>
            <p className="text-sm text-muted-foreground mt-1">
              {thread.summary ? thread.summary : "No summary generated yet."}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/threads/${thread.id}`}>
            View Conversation
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Threads;
