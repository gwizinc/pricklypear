import { subscribeToRealtimeBroadcast } from '@/lib/realtimeBroadcast';
import type { Message, ThreadId } from '@/types/message';
import type { RealtimePostgresChangesPayload } from '@supabase/realtime-js';

// Define new types for better type safety
export type ThreadedMessages = Record<ThreadId, Message[]>;
export type MessageDelta = RealtimePostgresChangesPayload<Message & { threadId: ThreadId }>;

interface MessageState {
  messages: ThreadedMessages;
  subscribers: Map<ThreadId, Set<(messages: Message[]) => void>>;
}

/**
 * MessageStore manages the state of messages across threads
 * and handles realtime updates from Supabase
 */
class MessageStore {
  private state: MessageState = {
    messages: {},
    subscribers: new Map(),
  };
  
  constructor() {
    // Listen for realtime broadcast events from other tabs
    subscribeToRealtimeBroadcast('supabase:change', (message) => {
      const { channelKey, payload } = message.payload;
      
      if (channelKey.startsWith('thread-') && channelKey.includes('messages')) {
        this.applyDelta(payload);
      }
    });
  }
  
  /**
   * Get messages for a specific thread
   */
  getMessages(threadId: ThreadId): Message[] {
    return this.state.messages[threadId] || [];
  }
  
  /**
   * Set messages for a specific thread
   */
  setMessages(threadId: ThreadId, messages: Message[]): void {
    this.state.messages[threadId] = [...messages];
    this.notifySubscribers(threadId);
  }
  
  /**
   * Apply delta from realtime changes
   */
  applyDelta(payload: MessageDelta): void {
    const { new: newRecord, old: oldRecord, eventType } = payload;
    
    if (!newRecord && !oldRecord) return;
    
    // Extract threadId using 'in' guard for proper type safety
    let threadId: ThreadId | undefined;

    if (newRecord && 'threadId' in newRecord) {
      threadId = newRecord.threadId;
    } else if (oldRecord && 'threadId' in oldRecord) {
      threadId = oldRecord.threadId;
    }
    
    if (!threadId) return;
    
    // Initialize thread messages array if it doesn't exist
    if (!this.state.messages[threadId]) {
      this.state.messages[threadId] = [];
    }
    
    // Process the delta based on event type
    if (eventType === 'INSERT') {
      // Check for duplicates before adding
      const isDuplicate = this.state.messages[threadId].some(msg => msg.id === newRecord!.id);
      
      if (!isDuplicate && newRecord) {
        // Add new message to the thread
        this.state.messages[threadId] = [
          ...this.state.messages[threadId],
          newRecord,
        ];
        
        // Sort messages chronologically by timestamp
        this.state.messages[threadId].sort((a, b) => {
          const aTime = new Date(a.timestamp).getTime();
          const bTime = new Date(b.timestamp).getTime();
          return aTime - bTime;
        });
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      // Update existing message
      this.state.messages[threadId] = this.state.messages[threadId].map(msg => 
        msg.id === newRecord.id ? { ...msg, ...newRecord } : msg
      );
    } else if (eventType === 'DELETE' && oldRecord) {
      // Remove deleted message
      this.state.messages[threadId] = this.state.messages[threadId].filter(
        msg => msg.id !== oldRecord.id
      );
    }
    
    // Notify subscribers about the change
    this.notifySubscribers(threadId);
  }
  
  /**
   * Notify all subscribers for a specific thread
   */
  private notifySubscribers(threadId: ThreadId): void {
    if (this.state.subscribers.has(threadId)) {
      const messages = this.getMessages(threadId);
      this.state.subscribers.get(threadId)?.forEach(callback => {
        try {
          callback(messages);
        } catch (error) {
          console.error('Error in message store subscriber callback', error);
        }
      });
    }
  }
  
  /**
   * Subscribe to changes for a specific thread
   */
  subscribe(threadId: ThreadId, callback: (messages: Message[]) => void): () => void {
    if (!this.state.subscribers.has(threadId)) {
      this.state.subscribers.set(threadId, new Set());
    }
    
    this.state.subscribers.get(threadId)?.add(callback);
    
    // Immediately call the callback with current messages
    callback(this.getMessages(threadId));
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.state.subscribers.get(threadId);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.state.subscribers.delete(threadId);
        }
      }
    };
  }
}

// Export singleton instance
export const messageStore = new MessageStore();
