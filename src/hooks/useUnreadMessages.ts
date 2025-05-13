import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUnreadCounts } from "@/services/messageService";

export const useUnreadMessages = () => {
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!user) {
        setTotalUnread(0);
        setThreadCounts({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const counts = await getAllUnreadCounts();

        // Calculate total across all threads
        const total = Object.values(counts).reduce(
          (sum, count) => sum + count,
          0,
        );

        setTotalUnread(total);
        setThreadCounts(counts);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCounts();

    // Set up a polling interval to check for new messages regularly
    const interval = setInterval(fetchUnreadCounts, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  return { totalUnread, threadCounts, isLoading };
};
