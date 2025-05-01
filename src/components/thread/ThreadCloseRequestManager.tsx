
import React from "react";
import ThreadCloseRequest from "@/components/ThreadCloseRequest";
import ThreadClosedBanner from "@/components/thread/ThreadClosedBanner";
import type { Thread } from "@/types/thread";

interface ThreadCloseRequestManagerProps {
  thread: Thread;
  currentUser: string;
  onApproveClose: () => Promise<void>;
  onRejectClose: () => Promise<void>;
}

const ThreadCloseRequestManager: React.FC<ThreadCloseRequestManagerProps> = ({
  thread,
  currentUser,
  onApproveClose,
  onRejectClose
}) => {
  const isThreadClosed = thread.status === 'closed';
  const hasCloseRequest = thread.closeRequestedBy !== null && thread.closeRequestedBy !== undefined;

  return (
    <>
      {hasCloseRequest && thread.closeRequestedBy && (
        <ThreadCloseRequest
          threadId={thread.id}
          requestedBy={thread.closeRequestedBy}
          currentUser={currentUser}
          onApproved={onApproveClose}
          onRejected={onRejectClose}
        />
      )}
      
      {isThreadClosed && <ThreadClosedBanner />}
    </>
  );
};

export default ThreadCloseRequestManager;
