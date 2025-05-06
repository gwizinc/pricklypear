import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useThreadDetails } from "@/hooks/useThreadDetails";
import ThreadHeader from "@/components/thread/ThreadHeader";
import ThreadMessages from "@/components/thread/ThreadMessages";
import ThreadMessageComposer from "@/components/thread/ThreadMessageComposer";
import ThreadCloseRequestManager from "@/components/thread/ThreadCloseRequestManager";
import MessageReviewDialog from "@/components/MessageReviewDialog";
import { useAuth } from "@/contexts/AuthContext";

const ThreadView = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  const currentUser = user?.email?.split('@')[0] || '';
  
  const {
    thread,
    messages,
    newMessage,
    isLoading,
    isSending,
    isReviewDialogOpen,
    // originalMessage removed
    kindMessage,
    isReviewingMessage,
    isGeneratingSummary,
    setNewMessage,
    handleSendMessage,
    handleSendReviewedMessage,
    setIsReviewDialogOpen,
    isRequestingClose,
    handleRequestClose,
    handleApproveClose,
    handleRejectClose
  } = useThreadDetails(threadId);

  const isThreadClosed = thread?.status === 'closed';

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
            onRequestClose={handleRequestClose}
            isGeneratingSummary={isGeneratingSummary}
          />
          
          <ThreadCloseRequestManager
            thread={thread}
            currentUser={currentUser}
            onApproveClose={handleApproveClose}
            onRejectClose={handleRejectClose}
          />

          <ThreadMessages 
            messages={messages} 
            currentUser={currentUser} 
          />

          <ThreadMessageComposer
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isSending={isSending || isReviewingMessage}
            isThreadClosed={isThreadClosed}
            onSendMessage={handleSendMessage}
          />

          {/* Request-close link (shown only when applicable) */}
          {!isThreadClosed && thread && !thread.closeRequestedBy && (
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={isRequestingClose}
              className="self-start mt-2 text-sm text-muted-foreground hover:underline hover:text-blue-600 disabled:cursor-not-allowed"
            >
              {isRequestingClose ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Requesting…
                </span>
              ) : (
                "Request thread to be closed."
              )}
            </button>
          )}
        </div>
      )}
      
      <MessageReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        newMessage={newMessage}
        kindMessage={kindMessage}
        onAccept={handleSendReviewedMessage}
        isLoading={isReviewingMessage}
      />
    </div>
  );
};

export default ThreadView;
