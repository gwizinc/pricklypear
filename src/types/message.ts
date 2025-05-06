
export type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  
  threadId?: string;
  
  // For system messages (close requests etc.)
  isSystem?: boolean;
  
  // Flag to identify current user's messages
  isCurrentUser?: boolean;
  
  // Read status information
  isRead?: boolean;
  readAt?: Date | null;
  
  readReceipts?: ReadReceipt[];
};

export type ReadReceipt = {
  userId: string;
  readAt: Date | null;
};
