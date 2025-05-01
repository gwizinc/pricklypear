import '@supabase/supabase-js';

// Augment RealtimeChannel.on to accept 'postgres_changes' event type

declare module '@supabase/supabase-js' {
  interface RealtimeChannel {
    on(
      event: 'postgres_changes' | 'broadcast' | 'presence' | 'system',
      filter: object,
      callback: (payload: any) => void
    ): RealtimeChannel;
  }
}
