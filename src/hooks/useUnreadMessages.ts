import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUnreadCounts } from '@/services/messageService';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  /**
   * Centralised fetcher so both polling and realtime subscription
   * can update the local unread-count state.
   */
  const fetchUnreadCounts = useCallback(async () => {
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
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

      setTotalUnread(total);
      setThreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Polling — keep for redundancy / initial population.
   */
  useEffect(() => {
    fetchUnreadCounts();

    const interval = setInterval(fetchUnreadCounts, 30_000); // every 30 s
    return () => clearInterval(interval);
  }, [fetchUnreadCounts]);

  /**
   * Realtime subscription to message_read_receipts for the current user.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    // Create a uniquely-named channel per user to avoid collisions
    const channel = supabase
      .channel(`message_read_receipts_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // listen for INSERT & UPDATE (and any other change)
          schema: 'public',
          table: 'message_read_receipts',
          filter: `profile_id=eq.${user.id}`,
        },
        () => {
          // Re-fetch counts whenever a relevant change occurs
          void fetchUnreadCounts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCounts]);

  return { totalUnread, threadCounts, isLoading };
};
