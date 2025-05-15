export interface ReadReceipt {
  message_id: string;
  user_id: string;
  read_at: string | null;
}

export interface MessageData {
  id: string;
  text: string;
  user_id: string;
  thread_id: string;
  timestamp: string;
  is_system?: boolean;
}

export interface UnreadCounts {
  [threadId: string]: number;
}
