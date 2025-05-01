import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { unreadStore } from '@/contexts/unreadStore';

export const useUnreadMessages = () => {
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();
  
  // Calculate total unread count using useMemo
  const totalUnread = useMemo(() => 
    Object.values(threadCounts).reduce((sum, count) => sum + count, 0),
    [threadCounts]
  );

  useEffect(() => {
    if (!user) {
      setThreadCounts({});
      return;
    }

    // Subscribe to unread store
    const unsub = unreadStore.subscribe(setThreadCounts);
    
    // Initialize unread store for current user
    unreadStore.init(user.id);
    
    return unsub;
  }, [user]);

  // Return isLoading: false for backward compatibility
  return { totalUnread, threadCounts, isLoading: false };
};
