
import { subscribeToRealtimeBroadcast } from '@/lib/realtimeBroadcast';
import type { Message } from '@/types/message';
import type { RealtimePostgresChangesPayload } from '@supabase/realtime-js';

interface MessageState {
  messages: Record<string, Message[]>;
  subscribers: Map<string, Set<(messages: Message[]) => void>>;
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
  getMessages(threadId: string): Message[] {
    return this.state.messages[threadId] || [];
  }
  
  /**
   * Set messages for a specific thread
   */
  setMessages(threadId: string, messages: Message[]): void {
    this.state.messages[threadId] = [...messages];
    this.notifySubscribers(threadId);
  }
  
  /**
   * Apply delta from realtime changes
   */
  applyDelta(payload: RealtimePostgresChangesPayload<any>): void {
    const { new: newRecord, old: oldRecord, eventType } = payload;
    
    if (!newRecord && !oldRecord) return;
    
    // Access conversation_id instead of threadId from Supabase payload
    // Fix type error by checking if the property exists first
    const threadId = (newRecord && 'conversation_id' in newRecord) 
      ? newRecord.conversation_id as string 
      : (oldRecord && 'conversation_id' in oldRecord) 
        ? oldRecord.conversation_id as string
        : undefined;
        
    if (!threadId) return;
    
    // Initialize thread messages array if it doesn't exist
    if (!this.state.messages[threadId]) {
      this.state.messages[threadId] = [];
    }
    
    // Process the delta based on event type
    if (eventType === 'INSERT') {
      // Check for duplicates before adding
      const isDuplicate = this.state.messages[threadId].some(msg => msg.id === newRecord?.id);
      
      if (!isDuplicate && newRecord) {
        // Map database record to Message type
        const message: Message = {
          id: newRecord.id,
          text: newRecord.selected_text,
          sender: newRecord.sender_profile_id,
          timestamp: new Date(newRecord.timestamp),
          original_text: newRecord.original_text,
          kind_text: newRecord.kind_text,
          isSystem: newRecord.is_system,
          threadId: threadId,
        };
        
        // Add new message to the thread
        this.state.messages[threadId] = [
          ...this.state.messages[threadId],
          message,
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
        msg.id === newRecord.id ? { 
          ...msg, 
          text: newRecord.selected_text,
          original_text: newRecord.original_text,
          kind_text: newRecord.kind_text,
          isSystem: newRecord.is_system,
        } : msg
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
  private notifySubscribers(threadId: string): void {
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
  subscribe(threadId: string, callback: (messages: Message[]) => void): () => void {
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
