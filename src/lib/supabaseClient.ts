import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://vgddrhyjttyrathqhefb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZGRyaHlqdHR5cmF0aHFoZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNDY4NTIsImV4cCI6MjA2MTYyMjg1Mn0.LMrdoexbaaIMdOa5TqS57nFlMMoSevqk3wXzfS1WXbE";

// Create supabase client with session persistence and auto-refresh options
export const supabaseClient = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Registry for keeping track of active channels
type ChannelRegistry = Map<string, RealtimeChannel>;
export const activeChannels: ChannelRegistry = new Map();

// Listen for auth events to reconnect channels on token refresh
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === 'TOKEN_REFRESHED') {
    // Rejoin all active channels when the token is refreshed
    activeChannels.forEach((channel, channelKey) => {
      supabaseClient.channel(channelKey).subscribe();
    });
  }
});
