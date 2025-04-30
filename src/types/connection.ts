
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface Connection {
  id: string;
  otherUserId: string;
  username: string;
  avatarUrl?: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  isUserSender: boolean;
}

export interface InviteResponse {
  success: boolean;
  message: string;
}
