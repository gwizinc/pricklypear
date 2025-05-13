export type ConnectionStatus = "pending" | "accepted" | "declined" | "disabled";

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
  connection?: Connection;
  error?: Error;
  success: boolean;
  message: string;
}
