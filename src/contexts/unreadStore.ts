import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getAllUnreadCounts } from '@/services/messageService';
import { subscribeToUnreadReceipts } from '@/lib/realtime';
import type { Database } from '@/integrations/supabase/types';

// Type alias that extends the message_read_receipts row with thread_id
type MessageReadReceiptWithThread = 
  Database['public']['Tables']['message_read_receipts']['Row'] & 
  { thread_id?: string | null };

type UnreadCountsCallback = (counts: Record<string, number>) => void;

class UnreadStore {
  private counts: Record<string, number> = {};
  private subscribers = new Set<UnreadCountsCallback>();
  private initialized = false;
  private unsubscribeRealtime: (() => void) | null = null;

  /**
   * Initialize the unread store for a specific user
   * Fetches initial counts and subscribes to realtime updates
   */
  async init(userId: string) {
    // Only initialize once per user
    if (this.initialized) return;

    // Fetch initial counts
    try {
      this.counts = await getAllUnreadCounts();
      this.notify();
    } catch (error) {
      console.error('Error fetching initial unread counts:', error);
      this.counts = {};
    }

    // Subscribe to realtime updates
    this.unsubscribeRealtime = subscribeToUnreadReceipts(
      userId,
      this.applyDelta.bind(this)
    );

    this.initialized = true;
  }

  /**
   * Apply delta from realtime update
   */
  private applyDelta(
    payload: RealtimePostgresChangesPayload<Database['public']['Tables']['message_read_receipts']>
  ) {
    const { eventType } = payload;
    
    // Determine which record to use based on the event type
    const record = eventType === 'DELETE' ? payload.old : payload.new;
    
    // Extract thread_id from the record using the strongly-typed alias instead of any
    const threadId = (record as MessageReadReceiptWithThread)?.thread_id;
    if (!threadId) return;
    
    // Ensure the thread exists in our counts
    if (!Object.prototype.hasOwnProperty.call(this.counts, threadId)) {
      this.counts[threadId] = 0;
    }
    
    // Update counts based on event type
    switch (eventType) {
      case 'INSERT':
        this.counts[threadId] += 1;
        break;
      case 'UPDATE':
        // If read_at becomes non-null, decrease count; if becomes null, increase count
        if (payload.old && payload.new) {
          if (!payload.old.read_at && payload.new.read_at) {
            this.counts[threadId] -= 1;
          } else if (payload.old.read_at && !payload.new.read_at) {
            this.counts[threadId] += 1;
          }
        }
        break;
    }
    
    // Ensure count is not negative
    if (this.counts[threadId] < 0) {
      this.counts[threadId] = 0;
    }
    
    // Notify subscribers of the update
    this.notify();
  }

  /**
   * Notify all subscribers of count changes
   */
  private notify() {
    this.subscribers.forEach(callback => callback({ ...this.counts }));
  }

  /**
   * Subscribe to unread count changes
   * @returns A function to unsubscribe
   */
  subscribe(callback: UnreadCountsCallback): () => void {
    this.subscribers.add(callback);
    
    // Immediately call the callback with current counts
    callback({ ...this.counts });
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get all unread counts
   */
  getCounts(): Record<string, number> {
    return { ...this.counts };
  }

  /**
   * Reset the store
   */
  reset() {
    this.counts = {};
    if (this.unsubscribeRealtime) {
      this.unsubscribeRealtime();
      this.unsubscribeRealtime = null;
    }
    this.initialized = false;
  }
}

// Create singleton instance
export const unreadStore = new UnreadStore();
