import { useParams } from "react-router-dom";
import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useThreadDetails } from "@/hooks/useThreadDetails";
import ThreadHeader from "@/components/thread/ThreadHeader";
import ThreadMessages from "@/components/thread/ThreadMessages";
import ThreadMessageComposer from "@/components/thread/ThreadMessageComposer";
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
  } = useThreadDetails(threadId);

  // Scroll handling
  // Holds a reference to the scrollable messages container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom when new messages arrive,
  // but only if the viewer is already near the bottom (≤150 px).
  // This prevents jumping when the user is reading older content.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const THRESHOLD_PX = 150;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const isNearBottom = distanceFromBottom <= THRESHOLD_PX;

    // Always scroll if content fits without overflow
    const contentFits = container.scrollHeight <= container.clientHeight;

    if (isNearBottom || contentFits) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

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
            isGeneratingSummary={isGeneratingSummary}
          />

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex flex-col flex-1 overflow-y-auto"
          >
            <ThreadMessages messages={messages} user={user} thread={thread} />

            <ThreadMessageComposer
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              isSending={isSending || isReviewingMessage}
              isThreadClosed={isThreadClosed}
              onSendMessage={handleSendMessage}
            />
          </div>
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
