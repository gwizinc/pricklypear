
import React from "react";
import { Lock } from "lucide-react";

const ThreadClosedBanner = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 mb-4">
      <p className="flex items-center">
        <Lock className="h-4 w-4 mr-2" />
        This thread has been closed. No new messages can be sent.
      </p>
    </div>
  );
};

export default ThreadClosedBanner;
