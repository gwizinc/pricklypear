import React from "react";
import ThreadCloseRequest from "@/components/ThreadCloseRequest";
import ThreadClosedBanner from "@/components/thread/ThreadClosedBanner";
import type { Thread } from "@/types/thread";
import type { User } from "@supabase/supabase-js";

interface ThreadCloseRequestManagerProps {
  thread: Thread;
  user: User;
  onApproveClose: () => Promise<void>;
  onRejectClose: () => Promise<void>;
}

const ThreadCloseRequestManager: React.FC<ThreadCloseRequestManagerProps> = ({
  thread,
  user,
  onApproveClose,
  onRejectClose,
}) => {
  const isThreadClosed = thread.status === "closed";
  const hasCloseRequest =
    thread.closeRequestedBy !== null && thread.closeRequestedBy !== undefined;

  return (
    <>
      {hasCloseRequest && thread.closeRequestedBy && (
        <ThreadCloseRequest
          threadId={thread.id}
          requestedByUserId={thread.closeRequestedBy}
          user={user}
          onApproved={onApproveClose}
          onRejected={onRejectClose}
        />
      )}

      {isThreadClosed && <ThreadClosedBanner />}
    </>
  );
};

export default ThreadCloseRequestManager;
