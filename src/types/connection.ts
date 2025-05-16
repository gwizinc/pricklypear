export type ConnectionStatus = "pending" | "accepted" | "declined" | "disabled";

export interface InviteResponse {
  error?: Error;
  success: boolean;
  message: string;
}
