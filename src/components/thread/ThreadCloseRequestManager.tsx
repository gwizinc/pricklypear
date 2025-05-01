
import React from "react";
import ThreadCloseRequest from "@/components/ThreadCloseRequest";
import ThreadClosedBanner from "@/components/thread/ThreadClosedBanner";
import type { Thread } from "@/types/thread";
import type { ProfileUser } from "@/types/user";

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
          requestedByUser={{
            id: thread.closeRequestedBy, // Using the name as an ID for now
            name: thread.closeRequestedBy,
            email: null
          }}
          currentUser={{
            id: currentUser, // Using the name as an ID for now
            name: currentUser,
            email: null
          }}
          onApproved={onApproveClose}
          onRejected={onRejectClose}
        />
      )}
      
      {isThreadClosed && <ThreadClosedBanner />}
    </>
  );
};

export default ThreadCloseRequestManager;
