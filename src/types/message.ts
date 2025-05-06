
export type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  
  // Fields for AI processing
  kind_text?: string;
  threadId?: string;
  
  // For system messages (close requests etc.)
  isSystem?: boolean;
  
  // Flag to identify current user's messages
  isCurrentUser?: boolean;
  
  // Read status information
  isRead?: boolean;
  readAt?: Date | null;
};
