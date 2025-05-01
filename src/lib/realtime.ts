
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabaseClient, activeChannels } from '@/lib/supabaseClient';
import { broadcastRealtimeEvent } from '@/lib/realtimeBroadcast';

export type ReconnectedHandler = (channel: RealtimeChannel) => Promise<void>;

export interface SubscriptionOptions {
  event?: string;
  filter?: string;
  backfillOnReconnect?: boolean;
  crossTabBroadcast?: boolean;
}

// Map to track subscriber reference counts for each channel
const channelSubscriberCounts = new Map<string, number>();

/**
 * Helper function to subscribe to Supabase Realtime channels
 * 
 * @param channelName The name of the channel to subscribe to
 * @param tableName The database table to subscribe to
 * @param callback The callback to run when data changes
 * @param options Subscription options
 * @param reconnectedHandler Optional handler for reconnection events
 * @returns A function to unsubscribe
 */
export function subscribeToRealtimeChanges(
  channelName: string,
  tableName: string,
  callback: (payload: any) => void,
  options: SubscriptionOptions = {},
  reconnectedHandler?: ReconnectedHandler
): () => void {
  const {
    event = '*',
    filter = '',
    backfillOnReconnect = true,
    crossTabBroadcast = true,
  } = options;

  // Create channel identifier
  const channelKey = `${channelName}:${tableName}:${event}:${filter}`;
  
  // Increment or initialize subscriber count
  const currentCount = channelSubscriberCounts.get(channelKey) || 0;
  channelSubscriberCounts.set(channelKey, currentCount + 1);
  
  // Check if channel already exists
  let channel = activeChannels.get(channelKey);
  
  if (!channel) {
    // Create a new channel
    channel = supabaseClient.channel(channelKey);
    
    // Configure channel with postgres_changes listener
    channel.on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table: tableName,
        filter,
      },
      (payload) => {
        // Handle the payload
        callback(payload);
        
        // Broadcast to other tabs if requested
        if (crossTabBroadcast) {
          broadcastRealtimeEvent('supabase:change', {
            channelKey,
            payload,
          });
        }
      }
    );
    
    // Configure system event listener for reconnection
    channel.on('system', { event: 'reconnected' }, async () => {
      // Handle reconnection - perform backfill if requested
      if (backfillOnReconnect && reconnectedHandler) {
        await reconnectedHandler(channel!);
      }
    });
    
    // Start the subscription
    channel.subscribe((status) => {
      console.log(`Channel ${channelKey} status: ${status}`);
    });
    
    // Register in the active channels registry
    activeChannels.set(channelKey, channel);
  }
  
  // Return an unsubscribe function
  return () => {
    const currentCount = channelSubscriberCounts.get(channelKey) || 0;
    
    if (currentCount <= 1) {
      // Last subscriber is unsubscribing
      channelSubscriberCounts.delete(channelKey);
      
      // Only unsubscribe if this is the last reference
      const channel = activeChannels.get(channelKey);
      if (channel) {
        console.log(`Unsubscribing from channel ${channelKey}`);
        channel.unsubscribe();
        activeChannels.delete(channelKey);
      }
    } else {
      // Decrement the subscriber count
      channelSubscriberCounts.set(channelKey, currentCount - 1);
    }
  };
}

/**
 * Helper function to subscribe to changes for a specific thread
 */
export function subscribeToThread(
  threadId: string,
  callback: (payload: any) => void,
  reconnectedHandler?: ReconnectedHandler
): () => void {
  return subscribeToRealtimeChanges(
    `thread-${threadId}`,
    'messages',
    callback,
    {
      filter: `conversation_id=eq.${threadId}`,
      crossTabBroadcast: true,
    },
    reconnectedHandler
  );
}
