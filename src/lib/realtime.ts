import { RealtimeChannel } from '@supabase/supabase-js';
import { supabaseClient, activeChannels } from '@/lib/supabaseClient';
import { broadcastRealtimeEvent } from '@/lib/realtimeBroadcast';

type ReconnectedHandler = (channel: RealtimeChannel) => Promise<void>;

export interface SubscriptionOptions {
  event?: string;
  filter?: string;
  backfillOnReconnect?: boolean;
  crossTabBroadcast?: boolean;
}

/**
 * Helper function to subscribe to Supabase Realtime channels
 * 
 * @param channelName The name of the channel to subscribe to
 * @param tableName The database table to subscribe to
 * @param callback The callback to run when data changes
 * @param options Subscription options
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
  
  // Check if channel already exists
  let channel = activeChannels.get(channelKey);
  
  if (!channel) {
    // Create and subscribe to the channel
    channel = supabaseClient
      .channel(channelKey)
      .on(
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
      )
      .on('system', { event: 'reconnected' }, async () => {
        // Handle reconnection - perform backfill if requested
        if (backfillOnReconnect && reconnectedHandler) {
          await reconnectedHandler(channel!);
        }
      });
      
    // Start the subscription
    channel.subscribe();
    
    // Register in the active channels registry
    activeChannels.set(channelKey, channel);
  }
  
  // Return an unsubscribe function
  return () => {
    // Only unsubscribe if this is the last reference
    const channel = activeChannels.get(channelKey);
    if (channel) {
      channel.unsubscribe();
      activeChannels.delete(channelKey);
    }
  };
}

/**
 * Helper function to subscribe to changes for a specific thread
 */
export function subscribeToThread(
  threadId: string,
  callback: (payload: any) => void
): () => void {
  return subscribeToRealtimeChanges(
    `thread-${threadId}`,
    'messages',
    callback,
    {
      filter: `threadId=eq.${threadId}`,
      crossTabBroadcast: true,
    }
  );
}
