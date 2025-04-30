import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Send, RefreshCw, Lock, X } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import ThreadCloseRequest from "@/components/ThreadCloseRequest";
import { saveMessage, getMessages, saveSystemMessage } from "@/services/messageService";
import { getThread, updateThreadSummary, requestCloseThread, approveCloseThread, rejectCloseThread } from "@/services/threadService";
import { useToast } from "@/hooks/use-toast";
import type { Thread } from "@/types/thread";
import type { Message } from "@/types/message";
import { useAuth } from "@/contexts/AuthContext";

const ThreadView = () => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [isRequestingClose, setIsRequestingClose] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadThread = async () => {
      if (!threadId) {
        navigate("/threads");
        return;
      }
      
      setIsLoading(true);
      
      const threadData = await getThread(threadId);
      if (!threadData) {
        toast({
          title: "Error",
          description: "Thread not found",
          variant: "destructive",
        });
        navigate("/threads");
        return;
      }
      
      setThread(threadData);
      setSummary(threadData.summary || "");
      
      const messagesData = await getMessages(threadId);
      setMessages(messagesData);
      
      setIsLoading(false);
    };
    
    loadThread();
  }, [threadId, navigate, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !thread || !user) return;
    
    setIsSending(true);
    
    const currentUser = user.email?.split('@')[0] || '';
    
    // Save message directly without AI processing for now
    const messageId = await saveMessage(
      currentUser,
      newMessage,
      newMessage, // Using the same text for all fields for simplicity
      newMessage,
      threadId!
    );
    
    if (messageId) {
      // Add to local messages list immediately
      const newMsg: Message = {
        id: messageId,
        text: newMessage,
        sender: currentUser,
        timestamp: new Date(),
        threadId: threadId
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
    } else {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSending(false);
  };

  const handleSaveSummary = async () => {
    if (!threadId || !summary.trim()) return;
    
    const success = await updateThreadSummary(threadId, summary);
    
    if (success) {
      // Update local thread state
      if (thread) {
        setThread({
          ...thread,
          summary
        });
      }
      
      setIsSummaryDialogOpen(false);
      toast({
        title: "Summary updated",
        description: "Thread summary has been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update summary. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestClose = async () => {
    if (!threadId || !user) return;
    
    setIsRequestingClose(true);
    
    const currentUser = user.email?.split('@')[0] || '';
    const success = await requestCloseThread(threadId, currentUser);
    
    if (success) {
      // Add a system message about the close request
      await saveSystemMessage(
        `${currentUser} has requested to close this thread.`,
        threadId
      );
      
      // Update local thread state to reflect the change
      if (thread) {
        setThread({
          ...thread,
          closeRequestedBy: currentUser
        });
      }
      
      toast({
        title: "Close request sent",
        description: "Waiting for the other participant to approve closing this thread.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to request thread closure. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsRequestingClose(false);
  };

  const handleApproveClose = async () => {
    if (!threadId || !thread || !user) return;
    
    const currentUser = user.email?.split('@')[0] || '';
    const success = await approveCloseThread(threadId);
    
    if (success) {
      // Add a system message about the thread closure
      await saveSystemMessage(
        `${currentUser} approved closing this thread. The thread is now closed.`,
        threadId
      );
      
      // Update local thread state
      setThread({
        ...thread,
        status: 'closed',
        closeRequestedBy: null
      });
      
      toast({
        title: "Thread closed",
        description: "This thread has been closed successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to close thread. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectClose = async () => {
    if (!threadId || !thread || !user) return;
    
    const currentUser = user.email?.split('@')[0] || '';
    const success = await rejectCloseThread(threadId);
    
    if (success) {
      // Add a system message about the rejection
      await saveSystemMessage(
        `${currentUser} rejected the request to close this thread.`,
        threadId
      );
      
      // Update local thread state
      setThread({
        ...thread,
        closeRequestedBy: null
      });
      
      toast({
        title: "Close request rejected",
        description: "The request to close this thread has been rejected.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to reject the close request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentUser = user?.email?.split('@')[0] || '';
  const isThreadClosed = thread?.status === 'closed';
  const otherParticipant = thread?.participants?.find(p => p !== currentUser);
  const hasCloseRequest = thread?.closeRequestedBy !== null && thread?.closeRequestedBy !== undefined;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      {thread && (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{thread.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Created {thread.createdAt.toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsSummaryDialogOpen(true)}
                disabled={isThreadClosed}
              >
                {thread.summary ? "Edit Summary" : "Add Summary"}
              </Button>
              
              {!isThreadClosed && !hasCloseRequest && (
                <Button 
                  variant="outline" 
                  onClick={handleRequestClose}
                  disabled={isRequestingClose}
                >
                  {isRequestingClose ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Request Close
                </Button>
              )}
            </div>
          </div>
          
          {hasCloseRequest && thread.closeRequestedBy && (
            <ThreadCloseRequest
              threadId={threadId!}
              requestedBy={thread.closeRequestedBy}
              currentUser={currentUser}
              onApproved={handleApproveClose}
              onRejected={handleRejectClose}
            />
          )}
          
          {isThreadClosed && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 mb-4">
              <p className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                This thread has been closed. No new messages can be sent.
              </p>
            </div>
          )}

          <div className="flex-grow overflow-y-auto px-2 py-4 border rounded-md mb-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  isCurrentUser={message.sender === currentUser}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={isThreadClosed ? "Thread is closed" : "Type your message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending || isThreadClosed}
              className="flex-grow"
            />
            <Button 
              onClick={handleSendMessage} 
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
        </div>
      )}

      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{thread?.summary ? "Edit Summary" : "Add Summary"}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Write a summary of this thread..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
            className="mt-2"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsSummaryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSummary}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThreadView;
