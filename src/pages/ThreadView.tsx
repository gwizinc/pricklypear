
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import ThreadCloseRequest from "@/components/ThreadCloseRequest";
import { saveMessage, getMessages, saveSystemMessage } from "@/services/messageService";
import { getThread, updateThreadSummary, requestCloseThread, approveCloseThread, rejectCloseThread } from "@/services/threadService";
import { useToast } from "@/hooks/use-toast";
import ThreadHeader from "@/components/thread/ThreadHeader";
import ThreadClosedBanner from "@/components/thread/ThreadClosedBanner";
import ThreadMessageComposer from "@/components/thread/ThreadMessageComposer";
import ThreadSummaryDialog from "@/components/thread/ThreadSummaryDialog";
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
    const success = await saveMessage(
      currentUser,
      newMessage,
      threadId!,
      newMessage, // Using the same text for selected_text
      newMessage  // Using the same text for kind_text
    );
    
    if (success) {
      // Add to local messages list immediately
      const newMsg: Message = {
        id: crypto.randomUUID(), // Generate a temporary ID
        text: newMessage,
        sender: currentUser,
        timestamp: new Date(),
        threadId: threadId!
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
          <ThreadHeader 
            thread={thread}
            isThreadClosed={isThreadClosed}
            isRequestingClose={isRequestingClose}
            onOpenSummaryDialog={() => setIsSummaryDialogOpen(true)}
            onRequestClose={handleRequestClose}
          />
          
          {hasCloseRequest && thread.closeRequestedBy && (
            <ThreadCloseRequest
              threadId={threadId!}
              requestedBy={thread.closeRequestedBy}
              currentUser={currentUser}
              onApproved={handleApproveClose}
              onRejected={handleRejectClose}
            />
          )}
          
          {isThreadClosed && <ThreadClosedBanner />}

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

          <ThreadMessageComposer
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isSending={isSending}
            isThreadClosed={isThreadClosed}
            onSendMessage={handleSendMessage}
          />
        </div>
      )}

      <ThreadSummaryDialog
        open={isSummaryDialogOpen}
        onOpenChange={setIsSummaryDialogOpen}
        summary={summary}
        setSummary={setSummary}
        onSaveSummary={handleSaveSummary}
      />
    </div>
  );
};

export default ThreadView;
