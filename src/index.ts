export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  original_text: string;
  timestamp: string;
}
