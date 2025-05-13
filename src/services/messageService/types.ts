export interface ReadReceipt {
  message_id: string;
  profile_id: string;
  read_at: string | null;
}

export interface MessageData {
  id: string;
  text: string;
  sender_profile_id: string;
  conversation_id: string;
  timestamp: string;
  is_system?: boolean;
}

export interface UnreadCounts {
  [threadId: string]: number;
}
