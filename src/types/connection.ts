export type ConnectionStatus = "pending" | "accepted" | "declined" | "disabled";

export interface InviteResponse {
  error?: Error;
  success: boolean;
  message: string;
}

export interface Connection {
  id: string;
  user_id: string | null;
  connected_user_id: string | null;
  invitee_email?: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}
