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

  const {
    thread,
    messages,
    newMessage,
    isLoading,
    isSending,
    isReviewDialogOpen,
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
    handleRejectClose,
  } = useThreadDetails(threadId);

  const isThreadClosed = thread?.status === "closed";

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
            user={user}
            onApproveClose={handleApproveClose}
            onRejectClose={handleRejectClose}
          />

          <ThreadMessages messages={messages} user={user} />

          <ThreadMessageComposer
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isSending={isSending || isReviewingMessage}
            isThreadClosed={isThreadClosed}
            onSendMessage={handleSendMessage}
          />
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
