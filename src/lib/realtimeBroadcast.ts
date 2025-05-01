type BroadcastMessage = {
  type: string;
  payload: any;
};

type MessageListener = (message: BroadcastMessage) => void;

class RealtimeBroadcastManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<MessageListener>> = new Map();
  private storageListener: ((event: StorageEvent) => void) | null = null;
  private channelName: string;
  private fallbackToStorage: boolean;
  
  constructor(channelName: string = 'supabase-realtime') {
    this.channelName = channelName;
    this.fallbackToStorage = false;
    
    // Try to use BroadcastChannel, fall back to localStorage if not available
    try {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.warn('BroadcastChannel not supported, falling back to localStorage', error);
      this.fallbackToStorage = true;
      this.setupStorageListener();
    }
  }
  
  private setupStorageListener() {
    this.storageListener = (event: StorageEvent) => {
      if (event.key?.startsWith(`${this.channelName}:`) && event.newValue) {
        try {
          const message = JSON.parse(event.newValue);
          this.notifyListeners(message);
        } catch (error) {
          console.error('Error parsing broadcast message from localStorage', error);
        }
      }
    };
    
    window.addEventListener('storage', this.storageListener);
  }
  
  private handleMessage(event: MessageEvent) {
    this.notifyListeners(event.data);
  }
  
  private notifyListeners(message: BroadcastMessage) {
    const { type } = message;
    
    if (this.listeners.has(type)) {
      this.listeners.get(type)?.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error('Error in broadcast listener', error);
        }
      });
    }
    
    // Also notify 'all' listeners
    if (this.listeners.has('all')) {
      this.listeners.get('all')?.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error('Error in broadcast listener', error);
        }
      });
    }
  }
  
  broadcast(type: string, payload: any) {
    const message: BroadcastMessage = { type, payload };
    
    if (this.fallbackToStorage) {
      // Use localStorage for cross-tab communication
      localStorage.setItem(
        `${this.channelName}:${Date.now()}`, 
        JSON.stringify(message)
      );
      // Clean up old messages to avoid filling up localStorage
      this.cleanupOldMessages();
    } else if (this.channel) {
      // Use BroadcastChannel
      this.channel.postMessage(message);
    }
    
    // Also notify local listeners
    this.notifyListeners(message);
  }
  
  private cleanupOldMessages() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(`${this.channelName}:`)
    );
    
    // Keep only the 20 most recent messages
    if (keys.length > 20) {
      keys
        .sort() // Sort by timestamp (part of the key)
        .slice(0, keys.length - 20)
        .forEach(key => localStorage.removeItem(key));
    }
  }
  
  subscribe(type: string, listener: MessageListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)?.add(listener);
    
    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(listener);
        if (typeListeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }
  
  cleanup() {
    if (this.channel) {
      this.channel.close();
    }
    
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
    
    this.listeners.clear();
  }
}

// Create a singleton instance
export const realtimeBroadcast = new RealtimeBroadcastManager();

// Helper functions for more convenient API
export const broadcastRealtimeEvent = (type: string, payload: any) => {
  realtimeBroadcast.broadcast(type, payload);
};

export const subscribeToRealtimeBroadcast = (
  type: string, 
  callback: MessageListener
): () => void => {
  return realtimeBroadcast.subscribe(type, callback);
};
